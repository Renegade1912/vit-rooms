import { User } from '@prisma/client';

interface transformedUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

/**
 * Transforms a user object into a transformed user object.
 *
 * @param user - The user object to transform.
 * @returns The transformed user object.
 */
export const single = (user: User): transformedUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
});

/**
 * Transforms an array of User objects into an array of transformed User objects.
 *
 * @param users - The array of User objects to be transformed.
 * @returns An array of transformed User objects.
 */
export const many = (users: User[]): transformedUser[] => users.map(single);
