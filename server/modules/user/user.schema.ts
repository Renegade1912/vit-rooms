import { z } from 'zod';

export const createUserSchema = z.object({
    name: z
        .string({
            required_error: 'Sie müssen einen Namen angeben',
            invalid_type_error: 'Der Name ist ungültig (min. 2 Zeichen)'
        })
        .min(2, 'Der Name muss mindestens 2 Zeichen lang sein')
        .max(255, 'Der Name darf maximal 255 Zeichen lang sein'),
    email: z
        .string({
            required_error: 'Sie müssen eine E-Mail-Adresse angeben',
            invalid_type_error: 'Die E-Mail-Adresse ist ungültig'
        })
        .email('Die E-Mail-Adresse ist ungültig'),
    password: z
        .string({
            required_error: 'Sie müssen ein Passwort angeben',
            invalid_type_error: 'Das Passwort ist ungültig (min. 6 Zeichen)'
        })
        .min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein')
});

export const loginUserSchema = z.object({
    name: z.string({
        required_error: 'Sie müssen einen Namen angeben'
    }),
    password: z.string({
        required_error: 'Sie müssen ein Passwort angeben'
    })
});

export const deleteUserSchema = z.object({
    id: z.string({
        required_error: 'Sie müssen eine ID angeben',
        invalid_type_error: 'Die ID ist ungültig'
    })
});

export const getUsersSchema = z.object({
    page: z.coerce
        .number({
            required_error: 'Sie müssen eine Seitenzahl angeben',
            invalid_type_error: 'Die Seitenzahl ist ungültig'
        })
        .min(1, 'Die Seitenzahl muss mindestens 1 sein'),
    perPage: z.coerce
        .number({
            required_error: 'Sie müssen eine Anzahl pro Seite angeben',
            invalid_type_error: 'Die Anzahl pro Seite ist ungültig'
        })
        .min(10, 'Die Anzahl pro Seite muss mindestens 10 sein'),
    filter: z.string().optional()
});

export const searchUsersSchema = z.object({
    filter: z.string({
        required_error: 'Sie müssen eine Suchanfrage angeben',
        invalid_type_error: 'Die Suchanfrage ist ungültig'
    })
});

export const updateUserSchema = z
    .object({
        name: z
            .string({
                required_error: 'Sie müssen einen Namen angeben',
                invalid_type_error: 'Der Name ist ungültig (min. 2 Zeichen)'
            })
            .min(2, 'Der Name muss mindestens 2 Zeichen lang sein')
            .max(255, 'Der Name darf maximal 255 Zeichen lang sein'),
        email: z
            .string({
                required_error: 'Sie müssen eine E-Mail-Adresse angeben',
                invalid_type_error: 'Die E-Mail-Adresse ist ungültig'
            })
            .email('Die E-Mail-Adresse ist ungültig'),
        password: z
            .string({
                required_error: 'Sie müssen ein Passwort angeben',
                invalid_type_error: 'Das Passwort ist ungültig (min. 6 Zeichen)'
            })
            .min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein')
            .optional()
            .or(z.literal(''))
    })
    .merge(deleteUserSchema);

export { deleteUserSchema as getUserSchema };

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
