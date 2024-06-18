import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event } from 'h3';
import { updateUserSchema } from '~/server/modules/user/user.schema';
import { updateUser } from '~/server/modules/user/user.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => updateUserSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id, name, email, password } = result.data;

    try {
        // Update user
        await updateUser(id, name, email, password);

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
                message = 'Die ID gehört zu keinem existierenden Benutzer.';
            } else if (e.code === 'P2002') {
                code = 409;
                message = 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
