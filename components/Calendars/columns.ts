import { h, type ComputedRef } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';
import type { EventTableEntry } from '../Events/columns';
import Actions from '~/components/Data/TableActions.vue';

export interface CalendarTableEntry {
    id: string;
    name: string;
    url: string;
    delete_on: null | string;
    _count: counts;
}

export interface CalendarEntry extends CalendarTableEntry {
    events: EventTableEntry[];
}

interface counts {
    events?: number | undefined;
}

interface State {
    delete: { calendar?: CalendarTableEntry; isOpen: boolean };
    create: boolean;
}

const state = ref<State>({
    delete: { isOpen: false },
    create: false
});

function useDeleteDialog() {
    return {
        isOpen: computed(() => state.value.delete.isOpen),
        calendar: computed(() => state.value.delete.calendar),
        open: (calendar: CalendarTableEntry) => {
            state.value.delete.calendar = calendar;
            state.value.delete.isOpen = true;
        },
        close: () => (state.value.delete.isOpen = false)
    };
}

function useCreateDialog() {
    return {
        isOpen: computed(() => state.value.create),
        open: () => (state.value.create = true),
        close: () => (state.value.create = false)
    };
}

const columns: ColumnDef<CalendarTableEntry>[] = [
    {
        accessorKey: 'name',
        header: () => h('div', { class: 'text-left' }, 'Name'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('name'));
        }
    },
    {
        accessorKey: 'delete_on',
        header: () => h('div', { class: 'text-left' }, 'Löschdatum'),
        cell: ({ row }) => {
            const value: string | undefined = row.getValue('delete_on');

            // Parse date or return empty string
            if (value) {
                const date = new Date(value);

                return h('div', { class: 'text-left' }, date.toLocaleDateString());
            }

            return h('div', { class: 'text-left' }, '-');
        }
    },
    {
        accessorKey: '_count',
        header: () => h('div', { class: 'text-center' }, 'Termine'),
        cell: ({ row }) => {
            const count: counts = row.getValue('_count');

            return h('div', { class: 'text-center' }, count.events);
        }
    },
    {
        id: 'actions',
        header: () => h('div', { class: 'text-center' }, 'Aktionen'),
        cell: ({ row }) => {
            const id = row.original.id;

            return h(
                'div',
                h(Actions, {
                    editFunc: () => navigateTo(`/calendar/${id}`),
                    deleteFunc: () => (state.value.delete = { calendar: row.original, isOpen: true })
                })
            );
        }
    }
];

export { columns, useDeleteDialog, useCreateDialog };
