import { Room } from '@prisma/client';
import { RoomsWithExtendedTags, getRoomEventsForToday, getRooms } from './room.service';
import { renderTagImage } from '../tag/tag.controller';

/**
 * Retrieves a map of rooms.
 *
 * @returns A map of rooms, where the room number is the key and the room object is the value.
 */
export async function getRoomsMap() {
    const rooms = await getRooms();
    const roomsMap = new Map<string, Room>();

    for (const room of rooms) {
        roomsMap.set(room.number.toString(), room);
    }

    return roomsMap;
}

/**
 * Updates the tags of multiple rooms.
 *
 * @param rooms - An array of rooms with tag IDs.
 */
export async function updateTagsOfRooms(rooms: RoomsWithExtendedTags[]) {
    rooms.every(async (room) => {
        const events = await getRoomEventsForToday(room.id);

        room.tags.every(async (tag) => await renderTagImage(tag, events));
    });
}
