import { Calendar } from '@prisma/client';
import { RoomsWithExtendedTags } from '../room/room.service';

/**
 * Creates a new calendar with the specified name and url.
 *
 * @param name - The calendar name.
 * @param url - The calendar fetch url.
 * @returns A Promise that resolves to the created calendar.
 */
export async function createCalendar(name: string, url: string, delete_on: Date | undefined): Promise<Calendar> {
    const calendar = await prisma.calendar.create({
        data: {
            name,
            url,
            delete_on
        }
    });

    return calendar;
}

/**
 * Retrieves a calendar by its ID.
 *
 * @param id - The ID of the calendar to retrieve.
 * @returns A Promise that resolves to the found calendar, or null if no calendar is found.
 */
export async function getCalendar(id: string): Promise<Calendar | null> {
    const calendar = await prisma.calendar.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            url: true,
            delete_on: true,

            _count: {
                select: {
                    events: true
                }
            }
        }
    });

    return calendar;
}

/**
 * Retrieves a list of calendars based on the provided pagination parameters and filter.
 *
 * @param page - The page number.
 * @param perPage - The number of calendars per page.
 * @param filter - The filter string to search for calendars.
 * @returns A promise that resolves to an array of calendar objects.
 */
export async function getFilteredCalendars(page: number, perPage: number, filter: string): Promise<Calendar[]> {
    const calendars = await prisma.calendar.findMany({
        orderBy: {
            name: 'asc'
        },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
            id: true,
            name: true,
            url: true,
            delete_on: true,

            _count: {
                select: {
                    events: true
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
                    name: {
                        startsWith: filter
                    }
                }
            ]
        }
    });

    return calendars;
}

/**
 * Retrieves count of calendars.
 *
 * @returns A Promise that resolves to the total number of calendars.
 */
export async function getCalendarsCount(): Promise<number> {
    const count = await prisma.calendar.count();

    return count;
}

/**
 * Deletes a calendar with the specified ID.
 *
 * @param id - The ID of the calendar to delete.
 * @returns A Promise that resolves when the calendar is successfully deleted.
 */
export async function deleteCalendar(id: string): Promise<Calendar> {
    const calendar = await prisma.calendar.delete({
        where: {
            id
        }
    });

    return calendar;
}

/**
 * Updates a calendar with the specified ID.
 *
 * @param id - The ID of the calendar to update.
 * @param name - The new calendar name.
 * @param url - The new calendar fetch url.
 * @returns A Promise that resolves to the updated calendar.
 */
export async function updateCalendar(
    id: string,
    name: string,
    url: string,
    delete_on: Date | undefined
): Promise<Calendar> {
    const calendar = await prisma.calendar.update({
        where: {
            id
        },
        data: {
            name,
            url,
            delete_on: delete_on ?? null
        }
    });

    return calendar;
}

/**
 * Retrieves all calendars.
 *
 * @returns A promise that resolves to an array of calendars.
 */
export async function getCalendars(): Promise<Calendar[]> {
    const calendars = await prisma.calendar.findMany();

    return calendars;
}

export async function getCalendarRoomsWithExtendedTagsById(id: string): Promise<RoomsWithExtendedTags[]> {
    const rooms = await prisma.room.findMany({
        where: {
            events: {
                some: {
                    calendarId: id
                }
            }
        },
        include: {
            tags: {
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    return rooms;
}
