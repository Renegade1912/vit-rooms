import bcrypt from 'bcrypt';
import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { LoginUserInput } from '~/server/modules/user/user.schema';
import { getUserByName } from '~/server/modules/user/user.service';

export default NuxtAuthHandler({
    secret: useRuntimeConfig().authSecret,
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/sign-in'
    },
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR.
        CredentialsProvider.default({
            name: 'Credentials',
            credentials: {
                name: { label: 'Benutzername', type: 'text' },
                password: { label: 'Passwort', type: 'password' }
            },

            /**
             * Authorizes the user based on the provided credentials.
             *
             * @param {LoginUserInput} credentials - The user credentials.
             * @returns {User|null} The authorized user or null if authorization fails.
             */
            async authorize(credentials: LoginUserInput) {
                try {
                    // Find user by name in db
                    const user = await getUserByName(credentials.name);

                    // If user does not exist, throw error
                    if (!user) {
                        throw createError({
                            statusCode: 409,
                            message: 'Der Benutzername existiert nicht.'
                        });
                    }

                    // Compare password with hashed password
                    const valid = await bcrypt.compare(credentials.password, user.password);
                    if (!valid) {
                        throw createError({
                            statusCode: 401,
                            message: 'Das Passwort ist falsch.'
                        });
                    }

                    return { id: user.id, name: user.name, email: user.email };
                } catch (error) {
                    // login failed -> we used throw createError
                    return null;
                }
            }
        })
    ],
    callbacks: {
        /**
         * Handles the JWT authentication.
         */
        async jwt({ token, user }: { token: JWT; user: User }) {
            const isSignIn = user ? true : false;

            if (isSignIn) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }

            return token;
        },

        /**
         * Handles the session.
         */
        session: async ({ session, token }: { session: Session; token: JWT }) => {
            session.user.id = token.id;

            return Promise.resolve(session);
        }
    }
});
