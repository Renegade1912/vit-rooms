import { createHooks } from 'hookable';

export interface Hooks {
    'sse:user:delete': (id: string) => void;
}

export const sseHooks = createHooks<Hooks>();
