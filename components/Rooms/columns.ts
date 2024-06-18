import { h } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';
import Actions from '~/components/Data/TableActions.vue';
import type { Tag } from '@prisma/client';

export interface RoomTableEntry {
    id: string;
    number: number;
    name: string;
    desc: string;
    _count: counts;
}

export interface RoomEntry extends RoomTableEntry {
    tags: Partial<Tag>[];
}

interface counts {
    events?: number;
    tags?: number;
}

interface State {
    delete: { room?: RoomTableEntry; isOpen: boolean };
    create: boolean;
}

const state = ref<State>({
    delete: { isOpen: false },
    create: false
});

function useDeleteDialog() {
    return {
        isOpen: computed(() => state.value.delete.isOpen),
        room: computed(() => state.value.delete.room),
        open: (room: RoomTableEntry) => {
            state.value.delete.room = room;
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

const columns: ColumnDef<RoomTableEntry>[] = [
    {
        accessorKey: 'number',
        header: () => h('div', { class: 'text-left' }, 'Nummer'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('number'));
        }
    },
    {
        accessorKey: 'name',
        header: () => h('div', { class: 'text-left' }, 'Name'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left ' }, row.getValue('name'));
        }
    },
    {
        accessorKey: 'desc',
        header: () => h('div', { class: 'text-left' }, 'Beschreibung'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left ' }, row.getValue('desc'));
        }
    },
    {
        accessorKey: '_count',
        header: () => h('div', { class: 'text-center' }, 'Termine'),
        cell: ({ row }) => {
            const count: counts = row.getValue('_count');
            return h('div', { class: 'text-center ' }, count.events);
        }
    },
    {
        accessorKey: '_count',
        header: () => h('div', { class: 'text-center' }, 'Tags'),
        cell: ({ row }) => {
            const count: counts = row.getValue('_count');
            return h('div', { class: 'text-center ' }, count.tags);
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
                    editFunc: () => navigateTo(`/room/${id}`),
                    deleteFunc: () => (state.value.delete = { room: row.original, isOpen: true })
                })
            );
        }
    }
];

export { columns, useDeleteDialog, useCreateDialog };
