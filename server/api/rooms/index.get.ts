import { H3Event } from 'h3';
import { getRoomsSchema } from '~/server/modules/room/room.schema';
import { getFilteredRooms, getRoomsCount } from '~/server/modules/room/room.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const response = await getValidatedQuery(event, (query) => getRoomsSchema.safeParse(query));

    // Handle validation errors
    if (!response.success) throw createValidationError(response);

    const { page, perPage, filter } = response.data;

    const rooms = await getFilteredRooms(page, perPage, filter || '');
    const roomsCount = await getRoomsCount();

    setResponseStatus(event, 200);
    return {
        rooms,
        meta: {
            total: roomsCount,
            page: Math.max(page, 1),
            perPage,
            totalPages: Math.ceil(roomsCount / perPage)
        }
    };
});
