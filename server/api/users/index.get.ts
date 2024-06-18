import { H3Event } from 'h3';
import { getUsersSchema } from '~/server/modules/user/user.schema';
import { getFilteredUsers, getUsersCount } from '~/server/modules/user/user.service';
import { userTransformers } from '~/server/transformers';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const response = await getValidatedQuery(event, (query) => getUsersSchema.safeParse(query));

    // Handle validation errors
    if (!response.success) throw createValidationError(response);

    const { page, perPage, filter } = response.data;

    const users = await getFilteredUsers(page, perPage, filter || '');
    const userResponse = userTransformers.many(users);
    const usersCount = await getUsersCount();

    setResponseStatus(event, 200);
    return {
        users: userResponse,
        meta: {
            total: usersCount,
            page: Math.max(page, 1),
            perPage,
            totalPages: Math.ceil(usersCount / perPage)
        }
    };
});
