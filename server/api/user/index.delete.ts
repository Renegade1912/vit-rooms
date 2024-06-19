import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { H3Event, H3Error } from 'h3';
import { deleteUserSchema } from '~/server/modules/user/user.schema';
import { deleteUser, getUsersCount } from '~/server/modules/user/user.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await readValidatedBody(event, (body) => deleteUserSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Get user count
        const count = await getUsersCount();

        // Refuse to delete the last user
        if (count === 1) {
            return createError({
                statusCode: 409,
                message: 'Sie können den letzten Benutzer nicht löschen.'
            });
        }

        // Delete user
        await deleteUser(id);

        // Force all clients to logout when own user is deleted (not the "best" solution, but it works)
        sseHooks.callHook('sse:user:delete', id);

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
            }
        } else console.error(e.message);

        throw createError({
            statusCode: code,
            message: message
        });
    }
});
