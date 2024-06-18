<template>
    <div>
        <PageHeader header="Termin" subtitle="Detailansicht des ausgewählten Termins." />

        <Separator class="my-4" />

        <EventsSingleSkeleton v-if="pending" />

        <div v-else class="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <div class="grid content-start gap-2 md:max-w-[32rem]">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="title" class="text-right"> Titel </Label>
                    <Input id="title" class="col-span-3" :default-value="event?.desc" disabled />
                </div>
                <div class="grid grid-cols-4 items-center gap-4 py-2">
                    <Label class="text-right"> Raum </Label>
                    <NuxtLink :to="`/room/${event?.room.id}`" class="col-span-3 text-primary">
                        {{ event?.room.name }}
                    </NuxtLink>
                </div>
                <div class="grid grid-cols-4 items-center gap-4 py-2">
                    <Label class="text-right"> Kalendar </Label>
                    <NuxtLink :to="`/calendar/${event?.calendar.id}`" class="col-span-3 text-primary">
                        {{ event?.calendar.name }}
                    </NuxtLink>
                </div>
            </div>

            <div class="grid content-start gap-2 md:max-w-[32rem]">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="date" class="text-right"> Datum </Label>
                    <Input id="date" class="col-span-3" :default-value="event?.date" disabled />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="start" class="text-right"> Start </Label>
                    <Input id="start" class="col-span-3" :default-value="event?.start" disabled />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="end" class="text-right"> Ende </Label>
                    <Input id="end" class="col-span-3" :default-value="event?.end" disabled />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toast } from '~/components/ui/toast';

useHead({
    titleTemplate: '%s - Termin'
});

definePageMeta({
    category: 'events',
    breadcrumb: {
        title: 'Termin',
        history: [
            {
                title: 'Termine',
                to: '/events'
            }
        ]
    }
});

interface EventServerResponse {
    calendarId: string;
    uid: string;
    desc: string;
    date: string;
    start: string;
    end: string;
    room: {
        id: string;
        name: string;
    };
    calendar: {
        id: string;
        name: string;
    };
}

const { calendarId, uid } = useRoute('event-calendarId-uid').params;

const {
    data: event,
    pending,
    error,
    refresh
} = await useFetch<EventServerResponse>('/api/event', {
    query: {
        calendarId,
        uid
    },
    method: 'GET',
    lazy: true,
    server: false,
    transform: (data) => ({
        ...data,
        date: new Date(data.date).toLocaleDateString()
    })
});

// Check if there was an error during the fetch
watch(error, (value) => {
    if (value) {
        toast({
            title: 'Fehler',
            description: value.message,
            variant: 'destructive'
        });

        // Navigate back to the rooms page
        return navigateTo('/events');
    }
});

// Computed state of API loading
const isLoading = computed(() => pending.value);
</script>
