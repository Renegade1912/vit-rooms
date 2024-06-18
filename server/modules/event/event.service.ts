import { Event, Prisma } from '@prisma/client';
import { DateRange, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from './event.controller';

const eventWithCalendarAndRoom = Prisma.validator<Prisma.EventDefaultArgs>()({
    include: {
        calendar: {
            select: {
                id: true,
                name: true
            }
        },
        room: {
            select: {
                id: true,
                name: true
            }
        }
    }
});

export type EventWithCalendarAndRoom = Prisma.EventGetPayload<typeof eventWithCalendarAndRoom>;

/**
 * Creates a new event
 *
 * @param uid - Calendar event uid.
 * @param date - The event date.
 * @param desc - The event description.
 * @param start - The event start time.
 * @param end - The event end time.
 * @param calendarId - The calendar ID.
 * @param roomId - The room ID.
 * @returns A Promise that resolves to the created event.
 */
export async function createEvent(
    uid: string,
    date: string,
    desc: string,
    start: string,
    end: string,
    calendarId: string,
    roomId: string
): Promise<Event> {
    const event = await prisma.event.create({
        data: {
            uid,
            date,
            desc,
            start,
            end,
            calendarId,
            roomId
        }
    });

    return event;
}

/**
 * Retrieves an event by its ID.
 *
 * @param uid - The uid of the event to retrieve.
 * @param calendarId - The calendar ID of the event to retrieve.
 * @returns A Promise that resolves to the found event, or null if no event is found.
 */
export async function getEvent(uid: string, calendarId: string): Promise<EventWithCalendarAndRoom | null> {
    const event = await prisma.event.findUnique({
        where: {
            id: {
                uid,
                calendarId
            }
        },
        include: {
            calendar: {
                select: {
                    id: true,
                    name: true
                }
            },
            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return event;
}

/**
 * Retrieves a list of events based on the provided pagination parameters and filter.
 *
 * @param page - The page number.
 * @param perPage - The number of events per page.
 * @param filter - The filter string to search for events.
 * @returns A promise that resolves to an array of event objects.
 */
export async function getFilteredEvents(page: number, perPage: number, filter: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
        orderBy: {
            calendarId: 'asc'
        },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
            uid: true,
            date: true,
            desc: true,
            start: true,
            end: true,
            calendarId: true,
            roomId: true,

            calendar: {
                select: {
                    id: true,
                    name: true
                }
            },

            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        where: {
            OR: [
                {
                    desc: {
                        contains: filter
                    }
                },
                {
                    calendar: {
                        name: {
                            contains: filter
                        }
                    }
                },
                {
                    room: {
                        name: {
                            contains: filter
                        }
                    }
                },
                {
                    desc: {
                        startsWith: filter
                    }
                },
                {
                    calendar: {
                        name: {
                            startsWith: filter
                        }
                    }
                },
                {
                    room: {
                        name: {
                            startsWith: filter
                        }
                    }
                }
            ]
        }
    });

    return events;
}

/**
 * Retrieves count of events.
 *
 * @returns A Promise that resolves to the total number of events.
 */
export async function getEventsCount(): Promise<number> {
    const count = await prisma.event.count();

    return count;
}

/**
 * Deletes an event with the specified ID.
 *
 * @param uid - The uid of the event to delete.
 * @param calendarId - The calendar ID of the event to delete.
 * @returns A Promise that resolves when the event is successfully deleted.
 */
export async function deleteEvent(uid: string, calendarId: string): Promise<Event> {
    const event = await prisma.event.delete({
        where: {
            id: {
                uid,
                calendarId
            }
        }
    });

    return event;
}

/**
 * Updates an event with the specified ID.
 *
 * @param id - The ID of the event to update.
 * @param uid - Calendar event uid.
 * @param date - The event date.
 * @param desc - The event description.
 * @param start - The event start time.
 * @param end - The event end time.
 * @param calendarId - The calendar ID.
 * @param roomId - The room ID.
 * @returns A Promise that resolves to the updated event.
 */
export async function updateEvent(
    id: string,
    uid: string,
    date: string,
    desc: string,
    start: string,
    end: string,
    calendarId: string,
    roomId: string
): Promise<Event> {
    const event = await prisma.event.update({
        where: {
            id: {
                uid,
                calendarId
            }
        },
        data: {
            uid,
            date,
            desc,
            start,
            end,
            calendarId,
            roomId
        }
    });

    return event;
}

/**
 * Creates or updates an event.
 *
 * @param uid - The unique identifier of the event.
 * @param date - The date of the event.
 * @param desc - The description of the event.
 * @param start - The start time of the event.
 * @param end - The end time of the event.
 * @param calendarId - The ID of the calendar associated with the event.
 * @param roomId - The ID of the room associated with the event.
 * @returns A Promise that resolves to the created or updated event.
 */
export async function createOrUpdateEvent(
    uid: string,
    date: string,
    desc: string,
    start: string,
    end: string,
    calendarId: string,
    roomId: string
): Promise<Event> {
    const event = await prisma.event.upsert({
        where: {
            id: {
                uid,
                calendarId
            }
        },
        update: {
            date,
            desc,
            start,
            end,
            calendarId,
            roomId
        },
        create: {
            uid,
            date,
            desc,
            start,
            end,
            calendarId,
            roomId
        }
    });

    return event;
}

/**
 * Creates or updates events in the database.
 *
 * @param events - An array of events to be created or updated.
 * @returns A promise that resolves to a boolean indicating whether the operation was successful.
 */
export async function createOrUpdateEvents(events: Event[]): Promise<boolean> {
    try {
        await prisma.$transaction(
            events.map((event) =>
                prisma.event.upsert({
                    where: {
                        id: {
                            uid: event.uid,
                            calendarId: event.calendarId
                        }
                    },
                    update: {
                        date: event.date,
                        desc: event.desc,
                        start: event.start,
                        end: event.end,
                        calendarId: event.calendarId,
                        roomId: event.roomId
                    },
                    create: {
                        uid: event.uid,
                        date: event.date,
                        desc: event.desc,
                        start: event.start,
                        end: event.end,
                        calendarId: event.calendarId,
                        roomId: event.roomId
                    }
                })
            )
        );

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Deletes old events from the specified calendar.
 *
 * @param calendarId - The ID of the calendar.
 * @param eventUids - An array of event UIDs to exclude from deletion.
 * @returns A Promise that resolves to void.
 */
export async function deleteOldEvents(calendarId: string, eventUids: string[]): Promise<void> {
    await prisma.event.deleteMany({
        where: {
            calendarId,
            NOT: {
                uid: {
                    in: eventUids
                }
            }
        }
    });
}

/**
 * Retrieves events by room ID and date.
 *
 * @param roomId - The ID of the room.
 * @param date - The date of the events.
 * @returns A promise that resolves to an array of events.
 */
export async function getEventsByRoomIdAndDate(roomId: string, date: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
        where: {
            roomId,
            date
        }
    });

    return events;
}

/**
 * Retrieves events from the database based on the calendar ID and date range.
 *
 * @param calendarId - The ID of the calendar.
 * @param date - The date to use as a reference for the date range.
 * @param range - The date range to filter the events.
 * @returns A promise that resolves to an array of events.
 * @throws An error if the date range is invalid.
 */
export async function getEventsByCalendarIdAndDateRange(calendarId: string, date: string, range: DateRange) {
    // Get the start and end date of the range
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (range === DateRange.WEEK) {
        startDate = startOfWeek(new Date(date));
        endDate = endOfWeek(new Date(date));
    } else if (range === DateRange.MONTH) {
        startDate = startOfMonth(new Date(date));
        endDate = endOfMonth(new Date(date));
    }

    if (!startDate || !endDate) {
        throw new Error('Ungültiger Datumsbereich');
    }

    const events = await prisma.event.findMany({
        where: {
            calendarId,
            date: {
                gte: startDate.toISOString(),
                lte: endDate.toDateString()
            }
        }
    });

    return events;
}
