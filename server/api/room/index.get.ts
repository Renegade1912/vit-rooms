import { H3Event } from 'h3';
import { getRoomSchema } from '~/server/modules/room/room.schema';
import { getRoom } from '~/server/modules/room/room.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (query) => getRoomSchema.safeParse(query));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    // Get room
    const room = await getRoom(id);

    // If room not found
    if (!room)
        throw createError({
            statusCode: 404,
            message: 'Der Raum wurde nicht gefunden.'
        });

    setResponseStatus(event, 200);
    return room;
});
