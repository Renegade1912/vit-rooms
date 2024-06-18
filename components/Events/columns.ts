import type { ColumnDef } from '@tanstack/vue-table';
import type { CalendarTableEntry } from '../Calendars/columns';
import type { RoomTableEntry } from '../Rooms/columns';
import Actions from '~/components/Data/TableActions.vue';

export interface EventTableEntry {
    uid: string;
    date: Date;
    desc: string;
    start: Date;
    end: Date;
    calendarId: string;
    roomId: string;
    room: Partial<RoomTableEntry>;
    calendar: Partial<CalendarTableEntry>;
}

const columns: ColumnDef<EventTableEntry>[] = [
    {
        accessorKey: 'desc',
        header: () => h('div', { class: 'text-left' }, 'Beschreibung'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('desc'));
        }
    },
    {
        accessorKey: 'date',
        header: () => h('div', { class: 'text-left' }, 'Datum'),
        cell: ({ row }) => {
            const date: Date = new Date(row.getValue('date'));

            return h('div', { class: 'text-left' }, date.toLocaleDateString());
        }
    },
    {
        accessorKey: 'start',
        header: () => h('div', { class: 'text-left' }, 'Start'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left' }, row.getValue('start'));
        }
    },
    {
        accessorKey: 'end',
        header: () => h('div', { class: 'text-left' }, 'Ende'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left' }, row.getValue('end'));
        }
    },
    {
        accessorKey: 'room',
        header: () => h('div', { class: 'text-left' }, 'Raum'),
        cell: ({ row }) => {
            const room: RoomTableEntry = row.getValue('room');

            return h('div', { class: 'text-left' }, room.name);
        }
    },
    {
        accessorKey: 'calendar',
        header: () => h('div', { class: 'text-left' }, 'Kalender'),
        cell: ({ row }) => {
            const calendar: CalendarTableEntry = row.getValue('calendar');

            return h('div', { class: 'text-left' }, calendar.name);
        }
    },
    {
        accessorKey: 'actions',
        header: () => h('div', { class: 'text-center' }, 'Aktionen'),
        cell: ({ row }) => {
            const uid = row.original.uid;
            const calendarId = row.original.calendarId;

            return h(
                'div',
                h(Actions, {
                    showView: true,
                    showDelete: false,
                    showEdit: false,
                    showFunc: () => navigateTo(`/event/${calendarId}/${uid}`)
                })
            );
        }
    }
];

export { columns };
