<template>
    <div class="mx-auto">
        <!-- Header -->
        <PageHeader header="Räume" subtitle="Neue Räume erstellen, existierende bearbeiten oder löschen." />

        <div class="mb-4 grid gap-4 sm:grid-cols-2 sm:justify-between">
            <!-- Search -->
            <DataTableSearch @update:filter="filter = $event" :disabled="pending" />

            <!-- Create Room -->
            <Button
                @click="createRoom"
                class="flex items-center justify-center space-x-2 sm:max-w-sm sm:justify-self-end"
            >
                <Plus class="size-4" />
                <span>Raum erstellen</span>
            </Button>
        </div>

        <!-- Skeleton -->
        <DataTableSkeleton v-if="pending" :columns="columns" :data="data?.rooms ?? []" />

        <!-- Table -->
        <DataTable
            v-if="!pending"
            :columns="columns"
            :data="data?.rooms ?? []"
            :page-count="data?.meta.totalPages ?? 0"
            :row-count="data?.meta.total ?? 0"
            :rows-per-page="pageSize"
            :current-page="pageIndex"
            @update:pageIndex="pagination.pageIndex = $event"
            @update:pageSize="pagination.pageSize = $event"
        />

        <!-- Dialogs -->
        <RoomsDeleteDialog @update="refresh" />
        <RoomsCreateDialog @update="refresh" />
    </div>
</template>

<script setup lang="ts">
import { columns, useCreateDialog } from '~/components/Rooms/columns';
import type { RoomTableEntry } from '~/components/Rooms/columns';
import { type PaginationState } from '@tanstack/vue-table';
import { Plus } from 'lucide-vue-next';
import { useMagicKeys } from '@vueuse/core';

const { open: createRoom } = useCreateDialog();

const { Ctrl_Q, Meta_Q } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === 'q' && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Ctrl_Q, Meta_Q], () => createRoom());

useHead({
    titleTemplate: '%s - Räume'
});

definePageMeta({
    category: 'rooms',
    breadcrumb: {
        title: 'Räume'
    }
});

interface RoomsServerResponse {
    rooms: RoomTableEntry[];
    meta: { total: number; page: number; perPage: number; totalPages: number };
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

// Fetch the room data
const { data, pending, refresh } = await useFetch<RoomsServerResponse>('/api/rooms', {
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
