import { defineCronHandler } from '#nuxt/cron';
import {
    deleteCalendar,
    getCalendarRoomsWithExtendedTagsById,
    getCalendars
} from '../modules/calendar/calendar.service';
import { updateTagsOfRooms } from '../modules/room/room.controller';
import { RoomsWithExtendedTags } from '../modules/room/room.service';

/**
 * Deletes calendars that have reached their deletion date and updates the tags of the affected rooms.
 * This cron job runs every two hours.
 */
export default defineCronHandler('everyTwoHours', async () => {
    const calendars = await getCalendars();
    const now = new Date();

    console.log('Checking for calendars to delete...');

    const roomsToUpdate: Array<RoomsWithExtendedTags> = [];

    for (const calendar of calendars) {
        if (calendar.delete_on) {
            const deleteOn = new Date(calendar.delete_on);

            if (deleteOn <= now) {
                // Get linked rooms of calendar events
                const rooms = await getCalendarRoomsWithExtendedTagsById(calendar.id);

                // Add rooms to update list without duplicates
                rooms.forEach((room) => {
                    if (!roomsToUpdate.some((r) => r.id === room.id)) {
                        roomsToUpdate.push(room);
                    }
                });

                // Delete calendar
                await deleteCalendar(calendar.id);

                console.log(`Calendar "${calendar.name}" deleted`);
            }
        }
    }

    if (roomsToUpdate.length === 0) {
        console.log('No calendars to delete');
        return;
    }

    console.log('Updating tags of affected rooms...');

    // Update relevant tags
    await updateTagsOfRooms(roomsToUpdate);
});
