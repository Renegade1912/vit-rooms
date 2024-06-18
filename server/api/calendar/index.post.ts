import { H3Event } from 'h3';
import { createCalendar } from '~/server/modules/calendar/calendar.service';
import { createCalendarSchema } from '~/server/modules/calendar/calendar.schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { fetchCalendarEvents } from '~/server/modules/calendar/calendar.controller';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => createCalendarSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { name, url, delete_on } = result.data;

    try {
        // Create calendar
        const calendar = await createCalendar(name, url, delete_on);

        // Fetch calendar events (includes render tags for rooms with today's events)
        fetchCalendarEvents(calendar);

        setResponseStatus(event, 201);
        return calendar;
    } catch (e: any) {
        // Default error code and message
        let code = 500;
        let message = 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.';

        // Handle Prisma (db) errors
        if (e instanceof PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (e.code === 'P2002') {
                code = 409;
                message = 'Ein Kalender mit dieser URL existiert bereits.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
