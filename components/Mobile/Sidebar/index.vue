<template>
    <Sheet>
        <SheetTrigger as-child>
            <Button size="icon" variant="link" class="mr-2 md:hidden">
                <Menu />
            </Button>
        </SheetTrigger>
        <SheetContent class="md:w-[250px] lg:w-[280px]" side="left">
            <SheetTitle>
                <p class="text-base font-bold">VIT - Raumplanung</p>
            </SheetTitle>
            <ScrollArea class="h-full py-6">
                <ul class="flex min-w-full flex-col space-y-2">
                    <template v-for="item in sidebarItems">
                        <h4 v-if="item.header" class="rounded-md px-2 py-1 text-sm font-semibold">
                            {{ item.header }}
                        </h4>
                        <div v-if="item.title" class="flex flex-col">
                            <SheetClose>
                                <SidebarLink :link="item.link" :title="item.title" :category="item.category">
                                    <template #icon>
                                        <component :is="icons[item.icon]" />
                                    </template>
                                </SidebarLink>
                            </SheetClose>
                        </div>
                    </template>
                </ul>
            </ScrollArea>
        </SheetContent>
    </Sheet>
</template>

<script setup lang="ts">
import { Menu, Home, Cuboid, Calendar, SquareGanttChart, Tv2, Users } from 'lucide-vue-next';
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
