import { H3Event } from 'h3';
import { getEventSchema } from '~/server/modules/event/event.schema';
import { getEvent } from '~/server/modules/event/event.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (query) => getEventSchema.safeParse(query));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { uid, calendarId } = result.data;

    // Get event
    const calendarEvent = await getEvent(uid, calendarId);

    // If event not found
    if (!calendarEvent)
        throw createError({
            statusCode: 404,
            message: 'Der Termin wurde nicht gefunden.'
        });

    setResponseStatus(event, 200);
    return calendarEvent;
});
