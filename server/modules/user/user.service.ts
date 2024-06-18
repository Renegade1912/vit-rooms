import { User } from '@prisma/client';
import { CreateUserInput } from './user.schema';
import bcrypt from 'bcrypt';

const saltRounds: number = 10;

/**
 * Creates a new user with the provided input.
 *
 * @param input - The input data for creating the user.
 * @returns The created user.
 */
export async function createUser(input: CreateUserInput): Promise<User> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(input.password, salt);
    const lowercaseName = input.name.toLowerCase();
    const lowercaseEmail = input.email.toLowerCase();

    const user = await prisma.user.create({
        data: { email: lowercaseEmail, password: hashedPassword, name: lowercaseName }
    });

    return user;
}

/**
 * Retrieves a user by their name.
 *
 * @param name - The name of the user.
 * @returns A promise that resolves to the user object if found, or null if not found.
 */
export async function getUserByName(name: string): Promise<User | null> {
    const lowercaseName = name.toLowerCase();

    const user = await prisma.user.findUnique({
        where: { name: lowercaseName }
    });

    return user;
}

/**
 * Retrieves a user by their ID.
 *
 * @param id - The ID of the user.
 * @returns A Promise that resolves to the user object if found, or null if not found.
 */
export async function getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { id }
    });

    return user;
}

export async function getFilteredUsers(page: number, perPage: number, filter: string): Promise<User[]> {
    const users = await prisma.user.findMany({
        orderBy: {
            name: 'asc'
        },
        skip: (page - 1) * perPage,
        take: perPage,
        where: {
            OR: [
                {
                    name: {
                        contains: filter
                    }
                },
                {
                    email: {
                        contains: filter
                    }
                },
                {
                    name: {
                        startsWith: filter
                    }
                },
                {
                    email: {
                        startsWith: filter
                    }
                }
            ]
        }
    });

    return users;
}

/**
 * Retrieves the count of users.
 *
 * @returns A promise that resolves to the number of users.
 */
export async function getUsersCount(): Promise<number> {
    const count = await prisma.user.count();

    return count;
}

/**
 * Deletes a user by their ID.
 *
 * @param id - The ID of the user to delete.
 * @returns A Promise that resolves to the deleted user.
 */
export async function deleteUser(id: string): Promise<User> {
    const user = await prisma.user.delete({
        where: { id }
    });

    return user;
}

/**
 * Updates a user's information in the database.
 * @param id - The ID of the user to update.
 * @param name - The new name for the user.
 * @param email - The new email for the user.
 * @param password - The new password for the user.
 * @returns - A promise that resolves when the user is updated.
 */
export async function updateUser(id: string, name: string, email: string, password: string | undefined) {
    const lowercaseName = name.toLowerCase();
    const lowercaseEmail = email.toLowerCase();

    if (password) {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id },
            data: { name, email, password: hashedPassword }
        });
        return;
    }

    await prisma.user.update({
        where: { id },
        data: { name: lowercaseName, email: lowercaseEmail }
    });
}
