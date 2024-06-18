import { H3Event } from 'h3';
import { searchRoomsSchema } from '~/server/modules/room/room.schema';
import { searchRooms } from '~/server/modules/room/room.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (query) => searchRoomsSchema.safeParse(query));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { filter } = result.data;

    // Search for rooms
    try {
        const rooms = await searchRooms(filter);

        setResponseStatus(event, 200);
        return rooms;
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.'
        });
    }
});
