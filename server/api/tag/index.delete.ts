import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { deleteTagSchema } from '~/server/modules/tag/tag.schema';
import { deleteTag } from '~/server/modules/tag/tag.service';
import { unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => deleteTagSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Delete tag from db
        await deleteTag(id);

        // Delete tag image if it exists
        const imgPath = join(process.cwd(), '/data/images/tags', `${id}.jpg`);
        if (existsSync(imgPath)) unlinkSync(imgPath);

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
