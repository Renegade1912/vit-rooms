import { z } from 'zod';
/* 
 toDo: 
 Try to make custom error messages for object required (applies to all schemas)
 
    {
        "code": "invalid_type",
        "expected": "object",
        "received": "undefined",
        "path": [],
        "message": "Required"
    } 
*/

export const createRoomSchema = z.object({
    number: z.coerce
        .number({
            required_error: 'Sie müssen eine Raumnummer angeben',
            invalid_type_error: 'Die Raumnummer ist ungültig'
        })
        .int('Die Raumnummer ist ungültig (keine Ganzzahl)')
        .min(0, 'Die Raumnummer ist ungültig (muss positiv sein)'),
    name: z
        .string({
            required_error: 'Sie müssen einen Namen angeben',
            invalid_type_error: 'Der Name ist ungültig (kein String)'
        })
        .min(2, 'Der Name ist ungültig (min. 2 Zeichen)')
        .max(255, 'Der Name ist ungültig (max. 255 Zeichen)'),
    desc: z
        .string({
            invalid_type_error: 'Die Beschreibung ist ungültig'
        })
        .optional()
});

export const deleteRoomSchema = z.object({
    id: z.string({
        required_error: 'Sie müssen eine ID angeben',
        invalid_type_error: 'Die ID ist ungültig'
    })
});

export const getRoomsSchema = z.object({
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

export const searchRoomsSchema = z.object({
    filter: z.string({
        required_error: 'Sie müssen eine Suchanfrage angeben',
        invalid_type_error: 'Die Suchanfrage ist ungültig'
    })
});

export const updateRoomSchema = createRoomSchema.merge(deleteRoomSchema);

export { deleteRoomSchema as getRoomSchema };
