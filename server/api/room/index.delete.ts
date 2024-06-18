import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { deleteRoomSchema } from '~/server/modules/room/room.schema';
import { deleteRoom, getRoom } from '~/server/modules/room/room.service';
import { renderTagImageForId } from '~/server/modules/tag/tag.controller';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => deleteRoomSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Get linked tags
        const room = await getRoom(id);

        // Delete room
        await deleteRoom(id);

        // Update unlinked tags now
        if (room?.tags) {
            for (const tag of room.tags) {
                renderTagImageForId(tag.id, []);
            }
        }

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
                message = 'Die ID gehört zu keinem existierenden Raum.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
