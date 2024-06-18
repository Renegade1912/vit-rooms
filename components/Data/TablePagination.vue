<template>
    <div class="flex items-center px-2 pt-4" v-bind="forwarded">
        <div class="flex w-full items-center justify-between space-x-6 lg:space-x-8">
            <!-- Rows per page -->
            <div class="flex items-center space-x-2">
                <p class="text-sm font-medium">Einträge pro Seite</p>
                <Select
                    :model-value="`${table.getState().pagination.pageSize}`"
                    @update:model-value="table.setPageSize"
                    v-on:update:model-value="updatePageSize(Number($event)), updatePageIndex(1)"
                >
                    <SelectTrigger class="h-8 w-[70px]">
                        <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
                    </SelectTrigger>
                    <SelectContent side="top">
                        <SelectItem v-for="pageSize in [10, 20, 30, 40, 50]" :key="pageSize" :value="`${pageSize}`">
                            {{ pageSize }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Page count -->
            <div class="flex w-[100px] items-center justify-center text-sm font-medium">
                Seite {{ table.getState().pagination.pageIndex + 1 }} von
                {{ table.getPageCount() > 0 ? table.getPageCount() : 1 }}
            </div>

            <!-- Pagination controls -->
            <div class="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    class="hidden h-8 w-8 p-0 lg:flex"
                    :disabled="!table.getCanPreviousPage()"
                    @click="updatePageIndex(1)"
                >
                    <span class="sr-only">Zur ersten Seite</span>
                    <ChevronFirst class="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    class="h-8 w-8 p-0"
                    :disabled="!table.getCanPreviousPage()"
                    @click="updatePageIndex(currentPage - 1)"
                >
                    <span class="sr-only">Vorherige Seite</span>
                    <ChevronLeft class="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    class="h-8 w-8 p-0"
                    :disabled="!table.getCanNextPage()"
                    @click="updatePageIndex(currentPage + 1)"
                >
                    <span class="sr-only">Nächste Seite</span>
                    <ChevronRight class="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    class="hidden h-8 w-8 p-0 lg:flex"
                    :disabled="!table.getCanNextPage()"
                    @click="updatePageIndex(pageCount)"
                >
                    <span class="sr-only">Zur letzten Seite</span>
                    <ChevronLast class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="TData">
import { type Table } from '@tanstack/vue-table';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-vue-next';
import { useForwardPropsEmits } from 'radix-vue';

interface DataTablePaginationProps {
    table: Table<TData>;
    currentPage: number;
    pageCount: number;
}

const emits = defineEmits(['update:pageIndex', 'update:pageSize']);
const props = defineProps<DataTablePaginationProps>();
const forwarded = useForwardPropsEmits(props, emits);

const updatePageIndex = (pageIndex: number) => emits('update:pageIndex', pageIndex);
const updatePageSize = (pageSize: number) => emits('update:pageSize', pageSize);
</script>
