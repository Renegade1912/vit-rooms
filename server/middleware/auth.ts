import { getServerSession } from '#auth';

const protectedRoutes = ['/api/calendar', '/api/dashboard', '/api/tag', '/api/user', '/api/room', '/api/event'];

export default eventHandler(async (event) => {
    const route = event.path;
    const session = await getServerSession(event);

    const isProtected = protectedRoutes.some((protectedRoute) => route.startsWith(protectedRoute));

    if (!session && isProtected) {
        throw createError({ message: 'Unauthenticated', statusCode: 403 });
    }
});
