import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { renderTagImage } from '~/server/modules/tag/tag.controller';
import { updateTagSchema } from '~/server/modules/tag/tag.schema';
import { updateTag } from '~/server/modules/tag/tag.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => updateTagSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id, desc, mac, width, height, roomId } = result.data;

    try {
        // Update tag
        const tag = await updateTag(id, desc, mac, width, height, roomId);

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

                if ((e.meta?.cause as string).includes('Room')) {
                    message = 'Die ID gehört zu keinem existierenden Raum.';
                } else message = 'Die ID gehört zu keinem existierenden Tag.';
            } else if (e.code === 'P2002') {
                code = 409;
                message = 'Ein Tag mit dieser MAC existiert bereits.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
