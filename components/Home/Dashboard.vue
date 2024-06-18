<template>
    <div>
        <HomeDashboardSkeleton v-if="pending" />

        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <NuxtLink v-for="card in dashboardCards" :to="card.url">
                <Card>
                    <CardHeader class="flex flex-row items-center justify-between pb-2">
                        <CardTitle class="text-sm font-medium"> {{ card.title }} </CardTitle>
                        <component :is="card.icon" class="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div class="text-2xl font-bold">{{ card.value }}</div>
                    </CardContent>
                </Card>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { Calendar, Cuboid, SquareGanttChart, Tv2 } from 'lucide-vue-next';

interface DashboardCard {
    title: string;
    icon: Component;
    value: ComputedRef<number>;
}

const { data, pending } = await useFetch('/api/dashboard', {
    lazy: true,
    server: false
});

const dashboardCards = ref<DashboardCard[]>([
    {
        title: 'Räume',
        icon: h(Cuboid),
        value: computed(() => data.value?.rooms || 0),
        url: '/rooms'
    },
    {
        title: 'Kalender',
        icon: h(Calendar),
        value: computed(() => data.value?.calendars || 0),
        url: '/calendars'
    },
    {
        title: 'Termine',
        icon: h(SquareGanttChart),
        value: computed(() => data.value?.events || 0),
        url: '/events'
    },
    {
        title: 'Tags',
        icon: h(Tv2),
        value: computed(() => data.value?.tags || 0),
        url: '/tags'
    }
]);
</script>
