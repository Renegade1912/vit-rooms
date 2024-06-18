import { H3Event } from 'h3';
import { getUserSchema } from '~/server/modules/user/user.schema';
import { getUserById } from '~/server/modules/user/user.service';
import { userTransformers } from '~/server/transformers';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (query) => getUserSchema.safeParse(query));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    // Get user
    const user = await getUserById(id);

    // If user not found
    if (!user)
        throw createError({
            statusCode: 404,
            message: 'Der Benutzer wurde nicht gefunden.'
        });

    const userResponse = userTransformers.single(user);

    setResponseStatus(event, 200);
    return userResponse;
});
