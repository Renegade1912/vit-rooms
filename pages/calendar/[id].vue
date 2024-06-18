<template>
    <div>
        <PageHeader header="Kalender" subtitle="Alle zu dem Kalender erfassten Daten." />

        <Separator class="my-4" />

        <CalendarsSingleSkeleton v-if="pending" />
        <div v-else>
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-3">
                <!-- Inputs -->
                <div class="col-span-2 grid content-center gap-2 md:max-w-[32rem]">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="name" class="text-right"> Nummer </Label>
                        <Input id="name" class="col-span-3" v-model="calendar.name" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="url" class="text-right"> Name </Label>
                        <Input id="url" class="col-span-3" v-model="calendar.url" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="delete_on" class="text-right"> Löschdatum </Label>
                        <Popover v-model:open="isCalendarOpen">
                            <PopoverTrigger as-child>
                                <Button
                                    variant="outline"
                                    :class="
                                        cn(
                                            'col-span-3 justify-start text-left font-normal',
                                            !calendar.delete_on && 'text-muted-foreground'
                                        )
                                    "
                                >
                                    <CalendarIcon class="mr-2 h-4 w-4" />
                                    {{
                                        calendar.delete_on
                                            ? df.format(calendar.delete_on.toDate(getLocalTimeZone()))
                                            : 'Datum auswählen'
                                    }}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-auto p-0">
                                <Calendar
                                    v-model="calendar.delete_on"
                                    initial-focus
                                    @update:modelValue="isCalendarOpen = false"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <!-- Events desktop -->
                <div class="hidden flex-col items-center justify-center place-self-center lg:flex">
                    <div class="flex flex-col items-center justify-center rounded-lg border p-12 shadow-sm">
                        <div class="pb-2 text-lg font-medium">Termine</div>
                        <p class="text-2xl font-bold">{{ calendar?._count.events || 0 }}</p>
                    </div>

                    <Button
                        @click="forceRefreshEvents"
                        class="mt-4 flex items-center space-x-2"
                        variant="secondary"
                        :disabled="isLoading"
                    >
                        <RefreshCcw
                            :class="cn('size-4', forceRefreshStatus === 'pending' && 'animate-spin duration-1500')"
                        />
                        <span>Termine neuladen</span>
                    </Button>
                </div>
            </div>

            <!-- Events mobile -->
            <div class="flex flex-col lg:hidden">
                <Separator class="my-4" />
                <div class="grid grid-flow-row gap-2 sm:grid-cols-2">
                    <div class="flex items-center py-2">
                        <div class="text-md mr-2 font-semibold tracking-tight">Anzahl zugeordneter Termine:</div>
                        <p>{{ calendar?._count.events || 0 }}</p>
                    </div>

                    <Button
                        @click="forceRefreshEvents"
                        class="flex items-center space-x-2 sm:max-w-[12rem] sm:place-self-end"
                        variant="secondary"
                        :disabled="isLoading"
                    >
                        <RefreshCcw
                            :class="cn('size-4', forceRefreshStatus === 'pending' && 'animate-spin duration-1500')"
                        />
                        <span>Termine neuladen</span>
                    </Button>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" @click="deleteCalendar(calendar)">Raum löschen</Button>
            <Button @click="execute" :disabled="isLoading" class="flex gap-x-2" ref="submit">
                <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                <span>Speichern</span></Button
            >
        </div>

        <!-- Dialogs -->
        <CalendarsDeleteDialog @update="navigateTo('/calendars')" />
    </div>
</template>

<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core';
import { Calendar as CalendarIcon, LoaderCircle, RefreshCcw } from 'lucide-vue-next';
import { DateFormatter, type DateValue, getLocalTimeZone, CalendarDate } from '@internationalized/date';
import { cn } from '~/lib/utils';
import type { CalendarTableEntry } from '~/components/Calendars/columns';
import { useDeleteDialog } from '~/components/Calendars/columns';
import { toast } from '~/components/ui/toast';
const { open: deleteCalendar } = useDeleteDialog();

const df = new DateFormatter('de-DE', {
    dateStyle: 'medium'
});

const isCalendarOpen = ref(false);

const { Ctrl_D, Meta_D, Ctrl_S, Meta_S } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if ((e.key === 'd' || e.key === 's') && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});
watch([Ctrl_D, Meta_D], () => deleteCalendar(calendar.value));
watch([Ctrl_S, Meta_S], () => execute());

useHead({
    titleTemplate: '%s - Kalender'
});

definePageMeta({
    category: 'calendars',
    breadcrumb: {
        title: 'Kalender',
        history: [
            {
                title: 'Kalender',
                to: '/calendars'
            }
        ]
    }
});

const { id } = useRoute('calendar-id').params;
const calendar = ref<CalendarTableEntry & { delete_on: DateValue | null }>({
    id: '',
    name: '',
    url: '',
    delete_on: null,
    _count: {
        events: 0
    }
});

// Fetch the calendar data
const { pending, error, refresh } = await useFetch<CalendarTableEntry>('/api/calendar', {
    query: {
        id
    },
    onResponse: ({ response }) => {
        const date = response._data.delete_on ? new Date(response._data.delete_on) : null;
        Object.assign(calendar.value, {
            ...response._data,
            delete_on: date ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) : null
        });
    },
    method: 'GET',
    lazy: true,
    server: false
});

// Check if there was an error during the fetch
watch(error, (value) => {
    if (value) {
        toast({
            title: 'Fehler',
            description: value.message,
            variant: 'destructive'
        });

        // Navigate back to the tags page
        return navigateTo('/calendars');
    }
});

// Make api body responsive to form data changes
const body = computed(() => ({
    id: calendar.value.id,
    name: calendar.value.name,
    url: calendar.value.url,
    delete_on: calendar.value.delete_on?.toDate(getLocalTimeZone())
}));

// Save API request
const { execute, status } = useFetch('/api/calendar', {
    method: 'PATCH',
    body,
    immediate: false,
    watch: false,
    onResponse: ({ response }) => {
        if (!response.ok) {
            toast({
                title: 'Fehler',
                description: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
                variant: 'destructive'
            });
            return;
        }

        toast({
            title: 'Erfolgreich',
            description: 'Die Änderungen wurden erfolgreich gespeichert.',
            variant: 'success'
        });
        refresh();
    }
});

// Force refresh events
const { execute: forceRefreshEvents, status: forceRefreshStatus } = useFetch('/api/calendar/refresh', {
    method: 'POST',
    query: {
        id
    },
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
            description: 'Termine wurden neu eingelesen.',
            variant: 'success'
        });
        refresh();
    }
});

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending' || pending.value || forceRefreshStatus.value == 'pending');
</script>
