import { H3Event } from 'h3';
import { getTagSchema } from '~/server/modules/tag/tag.schema';
import { getTag } from '~/server/modules/tag/tag.service';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (query) => getTagSchema.safeParse(query));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    // Get tag
    const tag = await getTag(id);

    // If tag not found
    if (!tag)
        throw createError({
            statusCode: 404,
            message: 'Das Tag wurde nicht gefunden.'
        });

    setResponseStatus(event, 200);
    return tag;
});
