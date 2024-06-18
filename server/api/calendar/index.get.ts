import { H3Event } from 'h3';
import { getCalendarSchema } from '~/server/modules/calendar/calendar.schema';
import { getCalendar } from '~/server/modules/calendar/calendar.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (query) => getCalendarSchema.safeParse(query));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    // Get calendar
    const calendar = await getCalendar(id);

    // If calendar not found
    if (!calendar)
        throw createError({
            statusCode: 404,
            message: 'Der Kalender wurde nicht gefunden.'
        });

    setResponseStatus(event, 200);
    return calendar;
});
