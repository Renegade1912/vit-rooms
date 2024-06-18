import { z } from 'zod';

export const createTagSchema = z.object({
    mac: z
        .string({
            required_error: 'Sie müssen eine MAC-Adresse angeben',
            invalid_type_error: 'Sie müssen eine MAC-Adresse angeben'
        })
        .regex(/^([0-9a-f]{2}:){5}([0-9a-f]{2})$/i, 'Die MAC-Adresse ist ungültig')
        .toLowerCase(),
    desc: z
        .string({
            required_error: 'Sie müssen eine Beschreibung angeben',
            invalid_type_error: 'Die Beschreibung ist ungültig (kein String)'
        })
        .min(1, 'Die Beschreibung muss mindestens 1 Zeichen lang sein'),
    width: z.coerce
        .number({
            required_error: 'Sie müssen eine Breite angeben',
            invalid_type_error: 'Die Breite ist ungültig (keine Ganzzahl)'
        })
        .min(0, 'Die Breite muss positiv sein'),
    height: z.coerce
        .number({
            required_error: 'Sie müssen eine Höhe angeben',
            invalid_type_error: 'Die Höhe ist ungültig (keine Ganzzahl)'
        })
        .min(0, 'Die Höhe muss positiv sein'),
    roomId: z.string().optional()
});

export const deleteTagSchema = z.object({
    id: z.string({
        required_error: 'Sie müssen eine ID angeben',
        invalid_type_error: 'Die ID ist ungültig'
    })
});

export const getTagsSchema = z.object({
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

export const updateTagSchema = createTagSchema.merge(deleteTagSchema);

export {
    deleteTagSchema as getTagSchema,
    deleteTagSchema as unlinkTagSchema,
    deleteTagSchema as forceRerenderTagSchema
};
