import { Prisma, Room, Event } from '@prisma/client';
import { TagWithRoom } from '../tag/tag.service';

const roomWithTags = Prisma.validator<Prisma.RoomDefaultArgs>()({
    include: {
        tags: {
            select: {
                id: true,
                mac: true,
                desc: true
            }
        }
    }
});

const roomWithEventsAndTags = Prisma.validator<Prisma.RoomDefaultArgs>()({
    include: {
        tags: {
            include: {
                room: true
            }
        },
        events: true
    }
});

export interface RoomsWithExtendedTags extends RoomWithTags {
    tags: TagWithRoom[];
}

export type RoomWithTags = Prisma.RoomGetPayload<typeof roomWithTags>;
export type RoomWithEventsAndTags = Prisma.RoomGetPayload<typeof roomWithEventsAndTags>;

/**
 * Creates a new room with the specified number, name and description.
 *
 * @param number - The room number.
 * @param name - The room name.
 * @param desc - The room description (optional).
 * @returns A Promise that resolves to the created room.
 */
export async function createRoom(number: number, name: string, desc: string | undefined): Promise<Room> {
    const room = await prisma.room.create({
        data: {
            number,
            name,
            desc
        }
    });

    return room;
}

/**
 * Retrieves a room by its ID.
 *
 * @param id - The ID of the room to retrieve.
 * @returns A Promise that resolves to the found room, or null if no room is found.
 */
export async function getRoom(id: string): Promise<RoomWithTags | null> {
    const room = await prisma.room.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            number: true,
            name: true,
            desc: true,

            // Only incluide tags, events are not needed and would be a performance hit
            tags: {
                select: {
                    id: true,
                    mac: true,
                    desc: true
                }
            },

            _count: {
                select: {
                    events: true
                }
            }
        }
    });

    return room;
}

/**
 * Retrieves a list of rooms based on the provided pagination parameters and filter.
 *
 * @param page - The page number.
 * @param perPage - The number of rooms per page.
 * @param filter - The filter string to search for rooms.
 * @returns A promise that resolves to an array of room objects.
 */
export async function getFilteredRooms(page: number, perPage: number, filter: string): Promise<Room[]> {
    // Offset based search
    // toDo: Implement cursor based search if database scales over 100.000 rooms ;-)

    const rooms = await prisma.room.findMany({
        orderBy: {
            number: 'asc'
        },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
            id: true,
            number: true,
            name: true,
            desc: true,

            _count: {
                select: {
                    events: true,
                    tags: true
                }
            }
        },
        where: {
            OR: [
                {
                    name: {
                        contains: filter
                    }
                },
                {
                    desc: {
                        contains: filter
                    }
                },
                {
                    name: {
                        startsWith: filter
                    }
                },
                {
                    desc: {
                        startsWith: filter
                    }
                }
            ]
        }
    });

    return rooms;
}

/**
 * Retrieves all rooms from the database.
 *
 * @returns A promise that resolves to an array of Room objects.
 */
export async function getRooms(): Promise<Room[]> {
    const rooms = await prisma.room.findMany({
        orderBy: {
            number: 'asc'
        },
        select: {
            id: true,
            number: true,
            name: true,
            desc: true
        }
    });

    return rooms;
}

/**
 * Retrieves the count of rooms.
 *
 * @returns A promise that resolves to the total number of rooms.
 */
export async function getRoomsCount(): Promise<number> {
    const count = await prisma.room.count();

    return count;
}

/**
 * Deletes a room with the specified ID.
 *
 * @param id - The ID of the room to delete.
 * @returns A Promise that resolves when the room is successfully deleted.
 */
export async function deleteRoom(id: string): Promise<void> {
    await prisma.room.delete({
        where: {
            id
        }
    });
}

/**
 * Updates a room with the specified ID.
 *
 * @param id - The ID of the room to update.
 * @param number - The new room number.
 * @param name - The new room name.
 * @param desc - The new room description.
 * @returns A Promise that resolves when the room is successfully updated.
 */
export async function updateRoom(id: string, number: number, name: string, desc?: string): Promise<RoomWithTags> {
    return await prisma.room.update({
        where: {
            id
        },
        data: {
            number,
            name,
            desc
        },
        include: {
            tags: {
                select: {
                    id: true,
                    mac: true,
                    desc: true
                }
            }
        }
    });
}

/**
 * Searches for rooms based on the provided filter.
 *
 * @param filter - The search filter.
 * @returns A Promise that resolves to an array of room objects.
 */
export async function searchRooms(filter: string): Promise<Partial<Room>[]> {
    const rooms = await prisma.room.findMany({
        take: 25,
        orderBy: {
            number: 'asc'
        },
        where: {
            OR: [
                {
                    name: {
                        contains: filter
                    }
                },
                {
                    desc: {
                        contains: filter
                    }
                },
                {
                    name: {
                        startsWith: filter
                    }
                },
                {
                    desc: {
                        startsWith: filter
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true
        }
    });

    return rooms;
}

/**
 * Retrieves the events for a room that occur today.
 *
 * @param id - The ID of the room.
 * @returns A promise that resolves to an array of events for today.
 */
export async function getRoomEventsForToday(id: string): Promise<Event[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const room = await prisma.room.findUnique({
        where: {
            id
        },
        select: {
            events: {
                orderBy: {
                    start: 'asc'
                },
                where: {
                    date: {
                        gte: todayStart,
                        lte: todayEnd
                    }
                }
            }
        }
    });

    if (!room || !room.events) return [];

    return room.events;
}

/**
 * Retrieves all rooms with today's events and tags.
 *
 * @returns A promise that resolves to an array of RoomWithEventsAndTags objects.
 */
export async function getAllRoomsWithTodayEventsAndTags(): Promise<RoomWithEventsAndTags[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const rooms = await prisma.room.findMany({
        include: {
            tags: {
                include: {
                    room: true
                }
            },
            events: {
                orderBy: {
                    start: 'asc'
                },
                where: {
                    date: {
                        gte: todayStart,
                        lte: todayEnd
                    }
                }
            }
        }
    });

    return rooms;
}
