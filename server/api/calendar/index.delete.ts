import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { deleteCalendarSchema } from '~/server/modules/calendar/calendar.schema';
import { deleteCalendar, getCalendarRoomsWithExtendedTagsById } from '~/server/modules/calendar/calendar.service';
import { updateTagsOfRooms } from '~/server/modules/room/room.controller';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => deleteCalendarSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Get linked rooms of calendar events
        const rooms = await getCalendarRoomsWithExtendedTagsById(id);

        // Delete calendar
        await deleteCalendar(id);

        // Update relevant tags
        await updateTagsOfRooms(rooms);

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
                message = 'Die ID gehört zu keinem existierenden Kalender.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
