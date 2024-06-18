import { H3Event } from 'h3';
import { createUser } from '~/server/modules/user/user.service';
import { createUserSchema } from '~/server/modules/user/user.schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { userTransformers } from '~/server/transformers';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => createUserSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    try {
        // Create user
        const user = await createUser(result.data);
        const userResponse = userTransformers.single(user);

        setResponseStatus(event, 201);
        return userResponse;
    } catch (e: any) {
        // Default error code and message
        let code = 500;
        let message = 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.';

        // Handle Prisma (db) errors
        if (e instanceof PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (e.code === 'P2002') {
                code = 409;

                if ((e.meta?.target as string).includes('email')) {
                    message = 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.';
                } else message = 'Ein Benutzer mit diesem Benutzernamen existiert bereits.';
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
