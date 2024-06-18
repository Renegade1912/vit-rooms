import { H3Event } from 'h3';
import { fetchCalendarEventsById } from '~/server/modules/calendar/calendar.controller';
import { forceRefreshCalendarSchema } from '~/server/modules/calendar/calendar.schema';
import { getCalendar, getCalendarRoomsWithExtendedTagsById } from '~/server/modules/calendar/calendar.service';
import { updateTagsOfRooms } from '~/server/modules/room/room.controller';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (body) => forceRefreshCalendarSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Does calendar exist?
        const calendar = await getCalendar(id);

        if (!calendar) {
            return createError({
                statusCode: 404,
                message: 'Der Kalender wurde nicht gefunden.'
            });
        }

        // Refresh calendar (includes render tags for rooms with today's events)
        await fetchCalendarEventsById(id);

        setResponseStatus(event, 200);
        return 'Ok';
    } catch (e: any) {
        console.error(e);

        throw createError({
            statusCode: 500,
            message: 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.'
        });
    }
});
