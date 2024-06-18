<template>
    <div class="mx-auto">
        <!-- Header -->
        <PageHeader
            header="Termine"
            subtitle="Alle zwischengespeicherten Termine der hinterlegten Kalender. Die Termine werden automatisiert verwaltet und können lediglich eingesehen werden."
        />

        <!-- Search -->
        <div class="mb-4 grid gap-4 sm:grid-cols-2">
            <DataTableSearch @update:filter="filter = $event" :disabled="pending" />
        </div>

        <!-- Skeleton -->
        <DataTableSkeleton v-if="pending" :columns="columns" :data="data?.events ?? []" />

        <!-- Table -->
        <DataTable
            v-if="!pending"
            :columns="columns"
            :data="data?.events ?? []"
            :page-count="data?.meta.totalPages ?? 0"
            :row-count="data?.meta.total ?? 0"
            :rows-per-page="pageSize"
            :current-page="pageIndex"
            @update:pageIndex="pagination.pageIndex = $event"
            @update:pageSize="pagination.pageSize = $event"
        />
    </div>
</template>

<script setup lang="ts">
import type { PaginationState } from '@tanstack/vue-table';
import { columns, type EventTableEntry } from '~/components/Events/columns';

useHead({
    titleTemplate: '%s - Termine'
});

definePageMeta({
    category: 'events',
    breadcrumb: {
        title: 'Termine'
    }
});

interface EventsServerResponse {
    events: EventTableEntry[];
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

// Fetch the event data
const { data, pending, refresh } = await useFetch<EventsServerResponse>('/api/events', {
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
