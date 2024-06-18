<template>
    <!-- height calc: screen height - navbar - footer - 2x border 1px -->
    <aside
        class="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem-3rem-2px)] w-full shrink-0 overflow-y-auto md:sticky md:block"
        data-aria-hidden="true"
        aria-hidden="true"
    >
        <ScrollArea class="h-full py-6 pr-6 lg:py-8">
            <ul class="flex min-w-full flex-col space-y-2">
                <template v-for="item in sidebarItems">
                    <h4 v-if="item.header" class="rounded-md px-2 py-1 text-sm font-semibold">
                        {{ item.header }}
                    </h4>
                    <div v-if="item.title">
                        <SidebarLink :link="item.link" :title="item.title" :category="item.category">
                            <template #icon>
                                <component :is="icons[item.icon]" />
                            </template>
                        </SidebarLink>
                    </div>
                </template>
            </ul>
        </ScrollArea>
    </aside>
</template>

<script setup lang="ts">
import { Home, Cuboid, Calendar, SquareGanttChart, Tv2, Users } from 'lucide-vue-next';
import type { Component } from 'vue';
import { useSidebarStore } from '~/stores/sidebar';

const { items: sidebarItems } = useSidebarStore();

const icons: { [key: string]: Component } = {
    Home: Home,
    Cuboid: Cuboid,
    Calendar: Calendar,
    SquareGanttChart: SquareGanttChart,
    Tv2: Tv2,
    Users: Users
};
</script>
