import { h } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';
import Actions from '~/components/Data/TableActions.vue';
import { NuxtLink } from '#components';

export interface TagTableEntry {
    id: string;
    mac: string;
    desc: string;
    height: number;
    width: number;
    room?: { id: string; name: string };
}

interface State {
    delete: { tag?: TagTableEntry; isOpen: boolean };
    create: boolean;
}

const state = ref<State>({
    delete: { isOpen: false },
    create: false
});

function useDeleteDialog() {
    return {
        isOpen: computed(() => state.value.delete.isOpen),
        tag: computed(() => state.value.delete.tag),
        open: (tag: TagTableEntry) => {
            state.value.delete.tag = tag;
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

const columns: ColumnDef<TagTableEntry>[] = [
    {
        accessorKey: 'mac',
        header: () => h('div', { class: 'text-left' }, 'MAC'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('mac'));
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
        accessorKey: 'width',
        header: () => h('div', { class: 'text-left' }, 'Breite'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left ' }, row.getValue('width'));
        }
    },
    {
        accessorKey: 'height',
        header: () => h('div', { class: 'text-left' }, 'Höhe'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left ' }, row.getValue('height'));
        }
    },
    {
        accessorKey: 'room',
        header: () => h('div', { class: 'text-left' }, 'Raum'),
        cell: ({ row }) => {
            const room = row.original.room;

            if (!room) {
                return h('div', { class: 'text-left' }, '-');
            }

            return h(NuxtLink, { class: 'text-left text-primary', to: `/room/${room.id}` }, () => h('div', room.name));
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
                    editFunc: () => navigateTo(`/tag/${id}`),
                    deleteFunc: () => (state.value.delete = { tag: row.original, isOpen: true })
                })
            );
        }
    }
];

export { columns, useDeleteDialog, useCreateDialog };
