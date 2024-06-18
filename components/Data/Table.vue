<template>
    <div>
        <div class="rounded-md border">
            <Table
                :data="props.data"
                :columns="props.columns"
                :page-count="props.pageCount"
                :row-count="props.rowCount"
                :rows-per-page="props.rowsPerPage"
                :current-page="props.currentPage"
            >
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <FlexRender
                                v-if="!header.isPlaceholder"
                                :render="header.column.columnDef.header"
                                :props="header.getContext()"
                            />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows?.length">
                        <TableRow
                            v-for="row in table.getRowModel().rows"
                            :key="row.id"
                            :data-state="row.getIsSelected() ? 'selected' : undefined"
                        >
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </TableCell>
                        </TableRow>
                    </template>
                    <template v-else>
                        <TableRow>
                            <TableCell :col-span="columns.length" class="h-24 text-center"> Keine Einträge. </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>

        <DataTablePagination
            :table="table"
            :currentPage="props.currentPage"
            :pageCount="props.pageCount"
            @update:page-index="$emit('update:pageIndex', $event)"
            @update:page-size="$emit('update:pageSize', $event)"
        />
    </div>
</template>

<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table';
import { FlexRender, getCoreRowModel, useVueTable, getPaginationRowModel } from '@tanstack/vue-table';

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    rowCount: number;
    rowsPerPage: number;
    currentPage: number;
}>();

const table = useVueTable({
    get data() {
        return props.data;
    },
    get columns() {
        return props.columns;
    },
    pageCount: props.pageCount,
    rowCount: props.rowCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
        pagination: {
            pageIndex: props.currentPage - 1,
            pageSize: props.rowsPerPage
        }
    }
});
</script>
