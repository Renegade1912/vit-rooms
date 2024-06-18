<template>
    <div class="mx-auto">
        <!-- Header -->
        <PageHeader
            header="Benutzer"
            subtitle="Verwalten Sie hier die Benutzer der Software. Jeder Benutzer hat automatisch Zugriff auf alle Funktionen."
        />

        <div class="mb-4 grid gap-4 sm:grid-cols-2 sm:justify-between">
            <!-- Search -->
            <DataTableSearch @update:filter="filter = $event" :disabled="pending" />

            <!-- Create Room -->
            <Button
                @click="createUser"
                class="flex items-center justify-center space-x-2 sm:max-w-sm sm:justify-self-end"
            >
                <Plus class="size-4" />
                <span>Benutzer erstellen</span>
            </Button>
        </div>

        <!-- Skeleton -->
        <DataTableSkeleton v-if="pending" :columns="columns" :data="data?.users ?? []" />

        <!-- Table -->
        <DataTable
            v-if="!pending"
            :columns="columns"
            :data="data?.users ?? []"
            :page-count="data?.meta.totalPages ?? 0"
            :row-count="data?.meta.total ?? 0"
            :rows-per-page="pageSize"
            :current-page="pageIndex"
            @update:pageIndex="pagination.pageIndex = $event"
            @update:pageSize="pagination.pageSize = $event"
        />

        <!-- Dialogs -->
        <UsersDeleteDialog @update="refresh" />
        <UsersCreateDialog @update="refresh" />
    </div>
</template>

<script setup lang="ts">
import { columns, useCreateDialog } from '~/components/Users/columns';
import type { UserTableEntry } from '~/components/Users/columns';
import { type PaginationState } from '@tanstack/vue-table';
import { Plus } from 'lucide-vue-next';
import { useMagicKeys } from '@vueuse/core';

const { open: createUser } = useCreateDialog();

const { Ctrl_Q, Meta_Q } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === 'q' && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Ctrl_Q, Meta_Q], () => createUser());

useHead({
    titleTemplate: '%s - Benutzer'
});

definePageMeta({
    category: 'users',
    breadcrumb: {
        title: 'Benutzer'
    }
});

interface UsersServerResponse {
    users: UserTableEntry[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}

// States
const pagination = ref<PaginationState>({
    pageIndex: 1,
    pageSize: 10
});
const filter = ref<string>('');

// Pagination values (all reactive)
const pageIndex = computed(() => pagination.value.pageIndex);
const pageSize = computed(() => pagination.value.pageSize);

// Fetch the user data
const { data, pending, refresh } = await useFetch<UsersServerResponse>('/api/users', {
    query: {
        page: pageIndex,
        perPage: pageSize,
        filter
    },
    lazy: true,
    server: false
});

// Watch for changes in the pagination state
watch([pageIndex, pageSize, filter], () => refresh());
</script>
