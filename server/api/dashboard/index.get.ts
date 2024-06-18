import { H3Event } from 'h3';
import { getDashboardData } from '~/server/modules/dashboard/dashboard.service';

export default defineEventHandler(async (event: H3Event) => {
    const dashboardData = await getDashboardData();

    setResponseStatus(event, 200);
    return dashboardData;
});
