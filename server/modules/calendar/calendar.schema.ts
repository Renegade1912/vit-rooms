import { z } from 'zod';

export const createCalendarSchema = z.object({
    name: z
        .string({
            required_error: 'Sie müssen einen Namen angeben',
            invalid_type_error: 'Der Namen ist ungültig (kein String)'
        })
        .min(2, 'Der Name ist ungültig (min. 2 Zeichen)'),
    url: z
        .string({
            required_error: 'Sie müssen eine URL angeben',
            invalid_type_error: 'Die URL ist ungültig'
        })
        .url('Die URL ist ungültig'),
    delete_on: z.coerce
        .date({
            invalid_type_error: 'Das Löschdatum ist ungültig'
        })
        .optional()
});

export const getCalendarsSchema = z.object({
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

export const deleteCalendarSchema = z.object({
    id: z.string({
        required_error: 'Sie müssen eine ID angeben',
        invalid_type_error: 'Die ID ist ungültig'
    })
});

export const updateCalendarSchema = createCalendarSchema.merge(deleteCalendarSchema);

export { deleteCalendarSchema as getCalendarSchema, deleteCalendarSchema as forceRefreshCalendarSchema };
