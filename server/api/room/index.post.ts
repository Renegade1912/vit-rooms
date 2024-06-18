import { H3Event } from 'h3';
import { createRoom } from '~/server/modules/room/room.service';
import { createRoomSchema } from '~/server/modules/room/room.schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fetchAllCalendarEvents } from '~/server/modules/calendar/calendar.controller';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => createRoomSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { number, name, desc } = result.data;

    try {
        // Create room
        const room = await createRoom(number, name, desc);

        // Fetch all calendar events to check if there are any events
        // Do not await this, as it is not necessary for the response and would slow it down
        // toDo: More efficient way to handle this?!?
        fetchAllCalendarEvents();

        setResponseStatus(event, 201);
        return room;
    } catch (e: any) {
        // Default error code and message
        let code = 500;
        let message = 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.';

        // Handle Prisma (db) errors
        if (e instanceof PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (e.code === 'P2002') {
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
