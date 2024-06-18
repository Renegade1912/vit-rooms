import { H3Event } from 'h3';
import { renderTagImageForId } from '~/server/modules/tag/tag.controller';
import { forceRerenderTagSchema } from '~/server/modules/tag/tag.schema';

const { createValidationError } = useThrowError();

export default defineEventHandler(async (event: H3Event) => {
    const result = await getValidatedQuery(event, (body) => forceRerenderTagSchema.safeParse(body));

    // Handle validation errors
    if (!result.success) throw createValidationError(result);

    const { id } = result.data;

    try {
        // Rerender tag
        await renderTagImageForId(id);

        setResponseStatus(event, 200);
        return 'Ok';
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: 'Es ist etwas schiefgelaufen. Probieren Sie es später erneut.'
        });
    }
});
