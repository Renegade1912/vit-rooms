import { defineCronHandler } from '#nuxt/cron';
import { updateAllTagImages } from '../modules/tag/tag.controller';

/**
 * Renders tags for all rooms with today's events.
 * This cron job runs hourly.
 */
export default defineCronHandler('hourly', async () => updateAllTagImages());
