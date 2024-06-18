<template>
    <div class="mx-auto">
        <!-- Header -->
        <PageHeader header="Tags" subtitle="Neue Tags hinzufügen, bestehende bearbeiten oder löschen." />

        <div class="mb-4 grid gap-4 lg:grid-cols-3 lg:justify-between">
            <!-- Search -->
            <DataTableSearch class="col-span-2 lg:col-span-1" @update:filter="filter = $event" :disabled="pending" />

            <div class="col-span-2 grid gap-2 lg:flex lg:justify-end">
                <!-- Rerender all tags -->
                <Button variant="secondary" @click="forceRefreshImages" class="space-x-2" :disabled="isLoading">
                    <RefreshCcw
                        :class="cn('size-4', forceRefreshStatus === 'pending' && 'animate-spin duration-1500')"
                    />
                    <span>Alle Tag Bilder aktualisieren</span>
                </Button>

                <!-- Create Tag -->
                <Button @click="createTag" class="space-x-2">
                    <Plus class="size-4" />
                    <span>Tag hinzufügen</span>
                </Button>
            </div>
        </div>

        <!-- Skeleton -->
        <DataTableSkeleton v-if="pending" :columns="columns" :data="data?.tags ?? []" />

        <!-- Table -->
        <DataTable
            v-if="!pending"
            :columns="columns"
            :data="data?.tags ?? []"
            :page-count="data?.meta.totalPages ?? 0"
            :row-count="data?.meta.total ?? 0"
            :rows-per-page="pageSize"
            :current-page="pageIndex"
            @update:pageIndex="pagination.pageIndex = $event"
            @update:pageSize="pagination.pageSize = $event"
        />

        <!-- Dialogs -->
        <TagsDeleteDialog @update="refresh" />
        <TagsCreateDialog @update="refresh" />
    </div>
</template>

<script setup lang="ts">
import { columns, useCreateDialog } from '~/components/Tags/columns';
import type { TagTableEntry } from '~/components/Tags/columns';
import { type PaginationState } from '@tanstack/vue-table';
import { Plus, RefreshCcw } from 'lucide-vue-next';
import { useMagicKeys } from '@vueuse/core';
import { toast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';

const { open: createTag } = useCreateDialog();

const { Ctrl_Q, Meta_Q } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === 'q' && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Ctrl_Q, Meta_Q], () => createTag());

useHead({
    titleTemplate: '%s - Tags'
});

definePageMeta({
    category: 'tags',
    breadcrumb: {
        title: 'Tags'
    }
});

interface tagsServerResponse {
    tags: TagTableEntry[];
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

// Fetch the tag data
const { data, pending, refresh } = useFetch<tagsServerResponse>('/api/tags', {
    query: {
        page: pageIndex,
        perPage: pageSize,
        filter
    },
    lazy: true,
    server: false
});

// Force update tag images
const { execute: forceRefreshImages, status: forceRefreshStatus } = useFetch('/api/tags/refresh', {
    method: 'POST',
    immediate: false,
    watch: false,
    onResponse: ({ response }) => {
        if (!response.ok) {
            toast({
                title: 'Fehler',
                description: response._data.message,
                variant: 'destructive'
            });
            return;
        }

        toast({
            title: 'Erfolgreich',
            description: 'Aktualisierungen wurde angestoßen.',
            variant: 'success'
        });
        1;
    }
});

const isLoading = computed(() => forceRefreshStatus.value == 'pending');

// Watch for changes in the pagination state
watch([pageIndex, pageSize, filter], () => refresh());
</script>
