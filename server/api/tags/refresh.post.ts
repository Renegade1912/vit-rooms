import { H3Event } from 'h3';
import { getRoom, getRoomEventsForToday } from '~/server/modules/room/room.service';
import { renderTagImageForId, updateAllTagImages } from '~/server/modules/tag/tag.controller';

export default defineEventHandler(async (event: H3Event) => {
    const body = await readBody(event);
    const id = body?.id;

    try {
        if (!id) {
            // Update all tags
            await updateAllTagImages();

            setResponseStatus(event, 200);
            return 'Ok';
        }

        // Update tags of room
        const room = await getRoom(id);
        const events = await getRoomEventsForToday(id);

        // Update tags
        if (room?.tags) {
            for (const tag of room.tags) {
                await renderTagImageForId(tag.id, events);
            }
        }

        setResponseStatus(event, 200);
        return 'Ok';
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.'
        });
    }
});
