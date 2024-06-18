import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { updateCalendarSchema } from '~/server/modules/calendar/calendar.schema';
import { updateCalendar } from '~/server/modules/calendar/calendar.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => updateCalendarSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id, name, url, delete_on } = result.data;

    try {
        console.log(id, name, url, delete_on);
        // Update calendar
        await updateCalendar(id, name, url, delete_on);

        // toDo: Update calendar events and render tags for rooms with today's events

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
