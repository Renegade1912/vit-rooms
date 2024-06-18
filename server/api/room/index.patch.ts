import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { fetchAllCalendarEvents } from '~/server/modules/calendar/calendar.controller';
import { updateRoomSchema } from '~/server/modules/room/room.schema';
import { getRoom, getRoomEventsForToday, updateRoom } from '~/server/modules/room/room.service';
import { renderTagImageForId } from '~/server/modules/tag/tag.controller';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => updateRoomSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id, number, name, desc } = result.data;

    try {
        const oldRoom = await getRoom(id);
        const room = await updateRoom(id, number, name, desc);

        // Did room number change?
        if (room.number !== oldRoom?.number) {
            // Fetch all calendar events to check if there are any events
            // toDo: More efficient way to handle this?!?
            await fetchAllCalendarEvents().then(async () => {
                // Pull events only once
                const events = await getRoomEventsForToday(room.id);

                // Update tags after events have been fetched
                if (room.tags) {
                    for (const tag of room.tags) {
                        renderTagImageForId(tag.id, events);
                    }
                }
            });
        }

        setResponseStatus(event, 200);
        return 'Ok';
    } catch (e: any) {
        // Default error code and message
        let code = 500;
        let message = 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.';

        // Handle Prisma (db) errors
        if (e instanceof PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
                code = 409;
                message = 'Die ID gehört zu keinem existierenden Raum.';
            } else if (e.code === 'P2002') {
                code = 409;
                message = 'Ein Raum mit dieser Nummer existiert bereits.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
