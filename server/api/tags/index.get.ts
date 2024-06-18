import { H3Event } from 'h3';
import { getTagsSchema } from '~/server/modules/tag/tag.schema';
import { getFilteredTags, getTagsCount } from '~/server/modules/tag/tag.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const response = await getValidatedQuery(event, (query) => getTagsSchema.safeParse(query));

    // Handle validation errors
    if (!response.success) throw createValidationError(response);

    const { page, perPage, filter } = response.data;

    const tags = await getFilteredTags(page, perPage, filter || '');
    const tagsCount = await getTagsCount();

    setResponseStatus(event, 200);
    return {
        tags,
        meta: {
            total: tagsCount,
            page: Math.max(page, 1),
            perPage,
            totalPages: Math.ceil(tagsCount / perPage)
        }
    };
});
