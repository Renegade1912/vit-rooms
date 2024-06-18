import { H3Event } from 'h3';
import { getCalendarsSchema } from '~/server/modules/calendar/calendar.schema';
import { getCalendarsCount, getFilteredCalendars } from '~/server/modules/calendar/calendar.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const response = await getValidatedQuery(event, (query) => getCalendarsSchema.safeParse(query));

    // Handle validation errors
    if (!response.success) throw createValidationError(response);

    const { page, perPage, filter } = response.data;

    const calendars = await getFilteredCalendars(page, perPage, filter || '');
    const calendarsCount = await getCalendarsCount();

    setResponseStatus(event, 200);
    return {
        calendars,
        meta: {
            total: calendarsCount,
            page: Math.max(page, 1),
            perPage,
            totalPages: Math.ceil(calendarsCount / perPage)
        }
    };
});
