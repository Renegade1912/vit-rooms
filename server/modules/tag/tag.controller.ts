import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TagWithRoom, getTag, getTagEvents } from './tag.service';
import { TagError, useThrowError } from '~/server/utils/useThrowError';
import { Tag, Event } from '@prisma/client';
import { EmergencyBody, NotConfiguredBody, ScheduleBody } from '~/types/renderer';
import { getAllRoomsWithTodayEventsAndTags } from '../room/room.service';

const { createTagError } = useThrowError();
const { AP_IMG_UPLOAD_URL, RENDER_SERVER_URL, AUTH_ORIGIN } = process.env;

/**
 * Renders the tag schedule for the given ID.
 *
 * @param id - The ID of the tag.
 * @param events - Optional array of events.
 * @returns A Promise that resolves to void.
 */
export async function renderTagImageForId(id: string, events?: Event[]): Promise<void> {
    const tag = await getTag(id);

    // Tag not found -> ignore
    if (!tag) {
        return;
    }

    await renderTagImage(tag, events);
}

/**
 * Renders the tag image based on the provided tag and events.
 * If the tag is linked with a room, it renders the tag schedule.
 * If the events are not provided, it retrieves the events for the tag.
 * If the tag is not linked with a room, it renders the configure screen for the tag.
 *
 * @param tag - The tag with room information.
 * @param events - Optional array of events associated with the tag.
 */
export async function renderTagImage(tag: TagWithRoom, events?: Event[]) {
    // Linked with room ?
    if (tag.room) {
        // Events provided ?
        if (!events) {
            // Check events for tag
            events = await getTagEvents(tag.id);
        }

        await renderTagSchedule(tag, events);
        return;
    }

    // Not linked with room
    await renderConfigureScreen(tag);
}

/**
 * Renders the emergency screen for a given tag.
 *
 * @param tag - The tag for which the emergency screen is rendered.
 */
export async function renderEmergencyScreen(tag: Tag) {
    try {
        // Get image for emergency screen
        const img: Blob = await renderImage(`${RENDER_SERVER_URL}/api/tag/emergency`, {
            width: tag.width,
            height: tag.height
        });

        // Save image for emergency screen in file system
        await saveTagImage(tag.id, img);
        console.log(`Successfully saved emergency image for tag ${tag.mac}`);

        // Upload image file to AP
        await uploadTagImage(tag.mac, img);
    } catch (e) {
        if (e instanceof TagError) {
            console.error(e.message);
            return;
        }

        console.error(`Failed to save emergency image for tag ${tag.mac}: ${e}`);
    }
}

/**
 * Renders the tag schedule for the given tag.
 *
 * @param tag - The tag with room information.
 * @param events - The list of events.
 * @returns A Promise that resolves when the image is saved and uploaded successfully, or rejects with an error.
 */
async function renderTagSchedule(tag: TagWithRoom, events: Event[]) {
    // Build events with keys desc, start, end
    const minimalizedEvents = events.map((event) => ({
        desc: event.desc,
        start: event.start,
        end: event.end
    }));

    // Get current date in format dd.mm.yyyy
    const date = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // Build body for rendering schedule
    const body = {
        name: tag.room?.name,
        date,
        width: tag.width,
        height: tag.height,
        events: minimalizedEvents,
        url: `${AUTH_ORIGIN}/tag/${tag.id}`
    };

    try {
        // Get image for tag
        const img: Blob = await renderImage(`${RENDER_SERVER_URL}/api/tag/schedule`, body);

        // Save image for tag in file system
        await saveTagImage(tag.id, img);
        console.log(`Successfully saved image for tag ${tag.mac}`);

        // Upload image file to AP
        await uploadTagImage(tag.mac, img);
    } catch (e) {
        if (e instanceof TagError) {
            console.error(e.message);
            return;
        }

        console.error(`Failed to save image for tag ${tag.mac}: ${e}`);
    }
}

/**
 * Renders configures screen for a given tag.
 *
 * @param tag - The tag object representing the screen to be configured.
 * @returns A Promise that resolves when the screen is successfully configured.
 */
async function renderConfigureScreen(tag: Tag) {
    try {
        // Get image for not configured screen
        const img: Blob = await renderImage(`${RENDER_SERVER_URL}/api/tag/configure`, {
            width: tag.width,
            height: tag.height,
            url: `${AUTH_ORIGIN}/tag/${tag.id}`
        });

        // Save image for not configured screen in file system
        await saveTagImage(tag.id, img);
        console.log(`Successfully saved not configured image for tag ${tag.mac}`);

        // Upload image file to AP
        await uploadTagImage(tag.mac, img);
    } catch (e) {
        if (e instanceof TagError) {
            console.error(e.message);
            return;
        }

        console.error(`Failed to save not configured image for tag ${tag.mac}: ${e}`);
    }
}

/**
 * Renders an image by making a POST request to the specified URL with the provided body.
 *
 * @param url - The URL to send the POST request to.
 * @param body - The body of the request, which can be either a ScheduleBody, EmergencyBody or NotConfiguredBody.
 * @returns A Promise that resolves to a Blob representing the rendered image.
 *
 * @throws {TagError} If there is an error while rendering the image.
 */
function renderImage(url: string, body: ScheduleBody | EmergencyBody | NotConfiguredBody): Promise<Blob> {
    // @ts-ignore - To deep stack for type checking ?!
    return $fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        onRequestError: () => {
            throw createTagError(`Failed to render image - can't reach render server`);
        },
        onResponseError: ({ response }) => {
            throw createTagError(`Failed to render image: ${response?._data.message}`);
        }
    }) as Promise<Blob>;
}

/**
 * Saves the image for a tag to the file system.
 *
 * @param id - The tag id to save the image for.
 * @param img - The image blob to save.
 */
async function saveTagImage(id: string, img: Blob) {
    const path = join(process.cwd(), '/data/images/tags', `${id}.jpg`);

    writeFileSync(path, Buffer.from(await img.arrayBuffer()));
}

/**
 * Uploads a tag image to the access point.
 *
 * @param mac - The MAC address of the tag.
 * @param img - The image file to upload.
 * @throws {TagUploadError} If the image upload fails.
 */
async function uploadTagImage(mac: string, img: Blob) {
    const formData = new FormData();
    formData.append('mac', mac.replace(/:/g, '').toUpperCase());
    formData.append('dither', '0');
    formData.append('file', img, `${mac}.jpg`);

    await $fetch(AP_IMG_UPLOAD_URL as string, {
        method: 'POST',
        body: formData,
        onRequestError: () => {
            throw createTagError(`Failed to upload image to AP - can't reach AP`);
        },
        onResponseError: ({ response }) => {
            throw createTagError(`Failed to upload image to AP: ${response?._data.message}`);
        }
    });
}

/**
 * Updates all tag images.
 * Renders tag images for all tags in all rooms with today's events.
 */
export async function updateAllTagImages() {
    console.log('Rendering tags...');

    const rooms = await getAllRoomsWithTodayEventsAndTags();

    await await Promise.all(
        rooms.map(async (room) => {
            await Promise.all(
                room.tags.map(async (tag) => {
                    await renderTagImage(tag, room.events);
                })
            );
        })
    );

    console.log('Tags rendered');
}
