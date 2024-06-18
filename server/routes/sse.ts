import { H3Event } from 'h3';
import { sseHooks } from '../utils/hooks';

export default defineEventHandler(async (event: H3Event) => {
    const eventStream = createEventStream(event);

    sseHooks.hook('sse:user:delete', async (id: string) => {
        await eventStream.push({
            event: 'userDeleted',
            data: JSON.stringify({ id })
        });
    });

    // cleanup the interval and close the stream when the connection is terminated
    eventStream.onClosed(async () => {
        await eventStream.close();
    });

    return eventStream.send();
});
