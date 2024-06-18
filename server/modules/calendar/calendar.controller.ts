import { Calendar, Event, Room } from '@prisma/client';
import { getCalendar, getCalendarRoomsWithExtendedTagsById, getCalendars } from './calendar.service';
import { ICSObject } from '~/types/ical';
import { createOrUpdateEvents, deleteOldEvents } from '../event/event.service';
import { getRoomsMap, updateTagsOfRooms } from '../room/room.controller';

// @ts-ignore - ical is not typed
import ical from 'ical';

const { ICAL_USER, ICAL_PASSWORD } = process.env;
const auth = 'Basic ' + btoa(`${ICAL_USER}:${ICAL_PASSWORD}`);

const ignoredEvents = ['Urlaub', 'S* ', 'Teilleistung', 'Lerntag', 'Klausur', 'Brückentag', 'Anreise'];

/**
 * Fetches calendar events by ID.
 *
 * @param id - The ID of the calendar events to fetch.
 * @returns A Promise that resolves to void.
 */
export async function fetchCalendarEventsById(id: string): Promise<void> {
    const roomsMap = await getRoomsMap();

    await processCalendarEventsById(id, roomsMap);
}

/**
 * Fetches calendar events for a given calendar.
 *
 * @param calendar - The calendar to fetch events for.
 * @returns A promise that resolves when the events are fetched and processed.
 */
export async function fetchCalendarEvents(calendar: Calendar): Promise<void> {
    const roomsMap = await getRoomsMap();

    await processCalendarEvents(calendar, roomsMap);
}

/**
 * Fetches all calendar events (of all calendars).
 *
 * @returns A Promise that resolves to void.
 */
export async function fetchAllCalendarEvents(): Promise<void> {
    // Get all calendars
    const calendars = await getCalendars();
    const roomsMap = await getRoomsMap();

    console.log(`Found ${calendars.length} calendar(s)`);

    for (const calendar of calendars) {
        await processCalendarEvents(calendar, roomsMap);
    }
}

async function fetchCalendarEventsFromUrl(url: string): Promise<ICSObject[]> {
    const calendarData = await $fetch(url, {
        headers: {
            authorization: auth
        },
        onRequestError() {
            throw new Error('Error fetching calendar events');
        }
    });

    const events: ICSObject[] = ical.parseICS(calendarData);

    return events;
}

async function processCalendarEventsById(id: string, roomsMap: Map<string, Room>) {
    const calendar = await getCalendar(id);

    if (!calendar) {
        return;
    }

    await processCalendarEvents(calendar, roomsMap);
}

async function processCalendarEvents(calendar: Calendar, roomsMap: Map<string, Room>) {
    console.log('Processing calendar:', calendar.name);

    const eventsList: Event[] = [];

    try {
        const events = await fetchCalendarEventsFromUrl(calendar.url);

        for (const event of Object.values(events)) {
            if (event.type !== 'VEVENT') {
                continue;
            }

            // Get room number from summary
            const location = JSON.stringify(event.summary).match(/Raum: (\d+)/);

            // Skip if no location is found
            if (!location) {
                continue;
            }

            // Trim leading zeros
            if (location) {
                location[1] = location[1].replace(/^0+/, '');
            }

            // Check if room exists in roomsMap
            const room = roomsMap.get(location[1]);

            // Skip if room does not exist
            if (!room) {
                continue;
            }

            // Skip room if desc contains
            if (ignoredEvents.some((ignored) => event.description.includes(ignored))) {
                continue;
            }

            // Parse start and end to Date
            const start = new Date(event.start);
            const end = new Date(event.end);

            // Build the event object
            const eventObj: Event = {
                uid: event.uid,
                date: start,
                start: `${('0' + start.getHours()).slice(-2)}:${('0' + start.getMinutes()).slice(-2)}`,
                end: `${('0' + end.getHours()).slice(-2)}:${('0' + end.getMinutes()).slice(-2)}`,
                desc: event.description,
                calendarId: calendar.id,
                roomId: room.id
            };

            eventsList.push(eventObj);
        }

        await createOrUpdateEvents(eventsList);
        await deleteOldEvents(
            calendar.id,
            eventsList.map((event) => event.uid)
        );

        console.log('Processed calendar:', calendar.name);

        // Get linked rooms of calendar events
        const rooms = await getCalendarRoomsWithExtendedTagsById(calendar.id);

        // Update relevant tags
        await updateTagsOfRooms(rooms);
    } catch (error) {
        console.error('Error processing calendar:', calendar.name, error);
    }
}
