<template>
    <div class="rounded-md border">
        <Table :columns="props.columns" :data="[]">
            <TableHeader>
                <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                    <!-- Normal header -->
                    <TableHead class="hidden sm:table-cell" v-for="header in headerGroup.headers" :key="header.id">
                        <Skeleton class="my-2 h-[30px]" />
                    </TableHead>

                    <!-- Small devices header -->
                    <TableHead class="table-cell sm:hidden">
                        <Skeleton class="my-2 h-[30px] w-full" />
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell :col-span="columns.length">
                        <Skeleton class="h-24 flex-1" />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>

<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table';
import { getCoreRowModel, useVueTable } from '@tanstack/vue-table';

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}>();

const table = useVueTable({
    get data() {
        return props.data;
    },
    get columns() {
        return props.columns;
    },
    getCoreRowModel: getCoreRowModel()
});
</script>
