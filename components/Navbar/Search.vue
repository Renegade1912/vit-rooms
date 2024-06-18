<template>
    <div class="w-full flex-1 md:w-auto md:flex-none">
        <button
            @click="handleOpenChange"
            class="relative inline-flex h-8 w-full items-center justify-start whitespace-nowrap rounded-[0.5rem] border border-input bg-background px-4 py-2 text-sm font-normal text-muted-foreground shadow-none ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-40 lg:w-64"
        >
            <span class="hidden lg:inline-flex">Quickstart</span>
            <span class="inline-flex lg:hidden">Quick...</span>
            <kbd
                class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 min-h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-sans text-[11px] font-medium opacity-100 sm:flex"
                ><span class="text-xs">⌘</span>J
            </kbd>
        </button>
        <CommandDialog :open="open" @update:open="handleOpenChange">
            <CommandInput placeholder="Tippe einen Befehl oder suche ..." />
            <CommandList>
                <CommandEmpty>Kein Treffer</CommandEmpty>
            </CommandList>
            <CommandGroup v-for="(group, name) in groupedItems" :heading="name as string">
                <NuxtLink v-for="item in group" class="w-full" :to="item.link" @click="open = !open">
                    <CommandItem :value="item.title" class="cursor-pointer">
                        <div class="flex items-center space-x-2">
                            <component class="h-4 w-4" :is="icons[item.icon]" />
                            <span>{{ item.title }} </span>
                        </div>
                    </CommandItem>
                </NuxtLink>
            </CommandGroup>
        </CommandDialog>
    </div>
</template>

<script setup lang="ts">
import { Home, Cuboid, Calendar, SquareGanttChart, Tv2, Users } from 'lucide-vue-next';
import { useMagicKeys } from '@vueuse/core';
import { useSidebarStore, type SidebarItem } from '~/stores/sidebar';

const { items } = useSidebarStore();

// Group items by group
const groupedItems = items.reduce((acc: { [group: string]: Array<SidebarItem> }, item: SidebarItem) => {
    if (item.group) {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
    }
    return acc;
}, {});

const icons: { [key: string]: Component } = {
    Home: Home,
    Cuboid: Cuboid,
    Calendar: Calendar,
    SquareGanttChart: SquareGanttChart,
    Tv2: Tv2,
    Users: Users
};

const open = ref(false);

const { Meta_J, Ctrl_J } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === 'j' && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Meta_J, Ctrl_J], (v) => {
    if (v[0] || v[1]) handleOpenChange();
});

function handleOpenChange() {
    open.value = !open.value;
}
</script>
