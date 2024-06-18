import { H3Event, sendStream } from 'h3';
import { existsSync, createReadStream } from 'node:fs';
import { join } from 'node:path';

const path = join(process.cwd(), '/data/images/tags');

export default defineEventHandler(async (event: H3Event) => {
    const id = getRouterParam(event, 'id');
    const imagePath = join(path, `${id}.jpg`);

    const exist = existsSync(imagePath);

    if (!exist) {
        throw createError({
            statusCode: 404,
            message: 'Image not found'
        });
    }

    return sendStream(event, createReadStream(imagePath));
});
