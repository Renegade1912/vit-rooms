import { z } from 'zod';

export const createEventSchema = z.object({
    uid: z.string({
        required_error: 'Sie müssen eine UID angeben',
        invalid_type_error: 'Die UID ist ungültig'
    }),
    date: z
        .string({
            required_error: 'Sie müssen ein Datum angeben',
            invalid_type_error: 'Das Datum ist ungültig'
        })
        .date('Das Datum ist ungültig'),
    desc: z.string({
        required_error: 'Sie müssen eine Beschreibung angeben',
        invalid_type_error: 'Die Beschreibung ist ungültig'
    }),
    start: z
        .string({
            required_error: 'Sie müssen eine Startzeit angeben',
            invalid_type_error: 'Die Startzeit ist ungültig'
        })
        .time('Die Startzeit ist ungültig'),
    end: z
        .string({
            required_error: 'Sie müssen eine Endzeit angeben',
            invalid_type_error: 'Die Endzeit ist ungültig'
        })
        .time('Die Endzeit ist ungültig'),
    calendarId: z.string({
        required_error: 'Sie müssen eine Kalender-ID angeben',
        invalid_type_error: 'Die Kalender-ID ist ungültig'
    }),
    roomId: z.string({
        required_error: 'Sie müssen eine Raum-ID angeben',
        invalid_type_error: 'Die Raum-ID ist ungültig'
    })
});

export const getEventsSchema = z.object({
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

export const deleteEventSchema = z.object({
    uid: z.string({
        required_error: 'Sie müssen eine UID angeben',
        invalid_type_error: 'Die UID ist ungültig'
    }),
    calendarId: z.string({
        required_error: 'Sie müssen eine Kalender-ID angeben',
        invalid_type_error: 'Die Kalender-ID ist ungültig'
    })
});

export const updateEventSchema = createEventSchema.merge(deleteEventSchema);

export { deleteEventSchema as getEventSchema };
