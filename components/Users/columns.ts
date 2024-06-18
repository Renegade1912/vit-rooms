import { h } from 'vue';
import type { ColumnDef } from '@tanstack/vue-table';
import Actions from '~/components/Data/TableActions.vue';
import { NuxtLink } from '#components';

export interface UserTableEntry {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface State {
    delete: { user?: UserTableEntry; isOpen: boolean };
    create: boolean;
}

const state = ref<State>({
    delete: { isOpen: false },
    create: false
});

function useDeleteDialog() {
    return {
        isOpen: computed(() => state.value.delete.isOpen),
        user: computed(() => state.value.delete.user),
        open: (user: UserTableEntry) => {
            state.value.delete.user = user;
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

const columns: ColumnDef<UserTableEntry>[] = [
    {
        accessorKey: 'name',
        header: () => h('div', { class: 'text-left' }, 'Name'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left font-medium' }, row.getValue('name'));
        }
    },
    {
        accessorKey: 'email',
        header: () => h('div', { class: 'text-left' }, 'E-Mail'),
        cell: ({ row }) => {
            return h('div', { class: 'text-left ' }, row.getValue('email'));
        }
    },
    {
        accessorKey: 'createdAt',
        header: () => h('div', { class: 'text-left' }, 'Erstellt am'),
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));

            return h('div', { class: 'text-left ' }, date.toLocaleDateString());
        }
    },
    {
        id: 'actions',
        header: () => h('div', { class: 'text-left' }, 'Aktionen'),
        cell: ({ row }) => {
            const id = row.original.id;

            return h(
                'div',
                h(Actions, {
                    editFunc: () => navigateTo(`/user/${id}`),
                    deleteFunc: () => (state.value.delete = { user: row.original, isOpen: true })
                })
            );
        }
    }
];

export { columns, useDeleteDialog, useCreateDialog };
