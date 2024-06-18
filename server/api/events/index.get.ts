import { H3Event } from 'h3';
import { getEventsSchema } from '~/server/modules/event/event.schema';
import { getEventsCount, getFilteredEvents } from '~/server/modules/event/event.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const response = await getValidatedQuery(event, (query) => getEventsSchema.safeParse(query));

    // Handle validation errors
    if (!response.success) throw createValidationError(response);

    const { page, perPage, filter } = response.data;

    const events = await getFilteredEvents(page, perPage, filter || '');
    const eventsCount = await getEventsCount();

    setResponseStatus(event, 200);
    return {
        events,
        meta: {
            total: eventsCount,
            page: Math.max(page, 1),
            perPage,
            totalPages: Math.ceil(eventsCount / perPage)
        }
    };
});
