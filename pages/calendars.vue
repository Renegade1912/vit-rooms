<template>
    <div class="mx-auto">
        <!-- Header -->
        <PageHeader
            header="Kalender"
            subtitle="Kalender in die automatische Raumplanung einbinden, bearbeiten oder löschen."
        />

        <div class="mb-4 grid gap-4 sm:grid-cols-2 sm:justify-between">
            <!-- Search -->
            <DataTableSearch @update:filter="filter = $event" :disabled="pending" />

            <!-- Create Room -->
            <Button
                @click="createCalendar"
                class="flex items-center justify-center space-x-2 sm:max-w-sm sm:justify-self-end"
            >
                <Plus class="size-4" />
                <span>Kalender erstellen</span>
            </Button>
        </div>

        <!-- Skeleton -->
        <DataTableSkeleton v-if="pending" :columns="columns" :data="data?.calendars ?? []" />

        <!-- Table -->
        <DataTable
            v-if="!pending"
            :columns="columns"
            :data="data?.calendars ?? []"
            :page-count="data?.meta.totalPages ?? 0"
            :row-count="data?.meta.total ?? 0"
            :rows-per-page="pageSize"
            :current-page="pageIndex"
            @update:pageIndex="pagination.pageIndex = $event"
            @update:pageSize="pagination.pageSize = $event"
        />

        <!-- Dialogs -->
        <CalendarsDeleteDialog @update="refresh" />
        <CalendarsCreateDialog @update="refresh" />
    </div>
</template>

<script setup lang="ts">
import { columns, useCreateDialog } from '~/components/Calendars/columns';
import type { CalendarTableEntry } from '~/components/Calendars/columns';
import { type PaginationState } from '@tanstack/vue-table';
import { Plus } from 'lucide-vue-next';
import { useMagicKeys } from '@vueuse/core';

const { open: createCalendar } = useCreateDialog();

const { Ctrl_Q, Meta_Q } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === 'q' && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Ctrl_Q, Meta_Q], () => createCalendar());

useHead({
    titleTemplate: '%s - Kalender'
});

definePageMeta({
    category: 'calendars',
    breadcrumb: {
        title: 'Kalender'
    }
});

interface CalendarsServerResponse {
    calendars: CalendarTableEntry[];
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
const { data, pending, refresh } = await useFetch<CalendarsServerResponse>('/api/calendars', {
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
