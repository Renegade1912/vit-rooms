interface DashboardData {
    rooms: number;
    calendars: number;
    events: number;
    tags: number;
}

export async function getDashboardData(): Promise<DashboardData> {
    const [rooms, calendars, events, tags] = await prisma.$transaction([
        prisma.room.count(),
        prisma.calendar.count(),
        prisma.event.count(),
        prisma.tag.count()
    ]);

    return {
        rooms,
        calendars,
        events,
        tags
    };
}
