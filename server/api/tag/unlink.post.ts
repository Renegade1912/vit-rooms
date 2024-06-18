import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { renderTagImage } from '~/server/modules/tag/tag.controller';
import { unlinkTagSchema } from '~/server/modules/tag/tag.schema';
import { unlinkTag } from '~/server/modules/tag/tag.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (body) => unlinkTagSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Unlink tag from room
        const tag = await unlinkTag(id);

        // Update tag image
        await renderTagImage(tag);

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
                message = 'Die ID gehört zu keinem existierenden Tag.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
