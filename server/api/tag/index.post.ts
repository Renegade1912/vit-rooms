import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { getRoom } from '~/server/modules/room/room.service';
import { renderTagImage } from '~/server/modules/tag/tag.controller';
import { createTagSchema } from '~/server/modules/tag/tag.schema';
import { createTag } from '~/server/modules/tag/tag.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => createTagSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { mac, desc, width, height, roomId } = result.data;

    // Check if room exists
    if (roomId) {
        const room = await getRoom(roomId);

        if (!room) {
            throw createError({
                statusCode: 404,
                message: 'Der angegebene Raum existiert nicht.'
            });
        }
    }

    try {
        // Create tag
        const tag = await createTag(mac, desc, width, height, roomId);

        // Render tag image
        await renderTagImage(tag);

        setResponseStatus(event, 201);
        return tag;
    } catch (e: any) {
        // Default error code and message
        let code = 500;
        let message = 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.';

        // Handle Prisma (db) errors
        if (e instanceof PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (e.code === 'P2002') {
                code = 409;
                message = 'Ein Tag mit dieser MAC-Adresse existiert bereits.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
