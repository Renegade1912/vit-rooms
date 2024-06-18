import { defineCronHandler } from '#nuxt/cron';
import { fetchAllCalendarEvents } from '../modules/calendar/calendar.controller';

/**
 * Updates the calendar every four hours.
 */
export default defineCronHandler('everyFourHours', async () => {
    fetchAllCalendarEvents();
});
