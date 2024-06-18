<template>
    <div>
        <PageHeader header="Raum" subtitle="Alle zu dem Raum erfassten Daten." />

        <Separator class="my-4" />

        <RoomsSingleSkeleton v-if="pending" />
        <div v-else>
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-3">
                <!-- Inputs -->
                <div class="col-span-2 grid content-center gap-2 md:max-w-[32rem]">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="number" class="text-right"> Nummer </Label>
                        <Input id="number" class="col-span-3" v-model="room.number" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="name" class="text-right"> Name </Label>
                        <Input id="name" class="col-span-3" v-model="room.name" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="desc" class="break-words text-right"> Beschreibung </Label>
                        <Input id="desc" class="col-span-3" v-model="room.desc" />
                    </div>
                </div>

                <!-- Events desktop -->
                <div
                    class="hidden flex-col items-center justify-center place-self-center rounded-lg border p-12 shadow-sm lg:flex"
                >
                    <div class="pb-2 text-lg font-medium">Termine</div>
                    <p class="text-2xl font-bold">{{ room?._count.events || 0 }}</p>
                </div>
            </div>

            <!-- Events mobile -->
            <div class="flex flex-col lg:hidden">
                <Separator class="my-4" />
                <div class="flex items-center py-2 lg:hidden">
                    <div class="text-md mr-2 font-semibold tracking-tight">Anzahl zugeordneter Termine:</div>
                    <p>{{ room?._count.events || 0 }}</p>
                </div>
            </div>

            <Separator class="my-4" />

            <!-- Linked Tags -->
            <div>
                <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div class="space-y-1">
                        <h2 class="text-2xl font-semibold tracking-tight">Tags</h2>
                        <p class="text-sm text-muted-foreground">Alle aktuell dem Raum zugeordneten Tags.</p>
                    </div>

                    <Button
                        @click="forceRefreshImages"
                        class="mt-2 flex items-center space-x-2 sm:max-w-[20rem] md:mt-0"
                        variant="secondary"
                        :disabled="isLoading"
                    >
                        <RefreshCcw
                            :class="cn('size-4', forceRefreshStatus === 'pending' && 'animate-spin duration-1500')"
                        />
                        <span>Bild für zugeordneten Tags aktualisieren</span>
                    </Button>
                </div>

                <div class="relative">
                    <ScrollArea v-if="room.tags.length">
                        <div class="flex space-x-4 pb-4">
                            <RoomsTagEntry
                                v-for="tag in room.tags"
                                :key="tag.mac"
                                :tag="tag"
                                class="w-[150px]"
                                :width="150"
                                :height="150"
                                :imageRerender="imageRerender"
                                @update="refresh"
                            />
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <div v-else class="h-[150px] w-[150px] rounded-md border">
                        <div class="flex h-full items-center justify-center text-center text-muted-foreground">
                            Keine Tags <br />
                            verlinkt
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" @click="deleteRoom(room)">Raum löschen</Button>
            <Button @click="execute" :disabled="isLoading" class="flex gap-x-2" ref="submit">
                <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                <span>Speichern</span></Button
            >
        </div>

        <!-- Dialogs -->
        <RoomsDeleteDialog @update="navigateTo('/rooms')" />
    </div>
</template>

<script setup lang="ts">
import type { RoomEntry } from '~/components/Rooms/columns';
import { toast } from '~/components/ui/toast';
import { useDeleteDialog } from '~/components/Rooms/columns';
import { useMagicKeys } from '@vueuse/core';
import { LoaderCircle, RefreshCcw } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const { open: deleteRoom } = useDeleteDialog();

const { Ctrl_D, Meta_D, Ctrl_S, Meta_S } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if ((e.key === 'd' || e.key === 's') && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});
watch([Ctrl_D, Meta_D], () => deleteRoom(room.value));
watch([Ctrl_S, Meta_S], () => execute());

useHead({
    titleTemplate: '%s - Raum'
});

definePageMeta({
    category: 'rooms',
    breadcrumb: {
        title: 'Raum',
        history: [
            {
                title: 'Räume',
                to: '/rooms'
            }
        ]
    }
});

const { id } = useRoute('room-id').params;
const room = ref<RoomEntry>({
    id: '',
    number: 0,
    name: '',
    desc: '',
    _count: {
        events: 0
    },
    tags: []
});
const imageRerender = ref(+Date.now());

// Fetch the room data
const { pending, error, refresh } = await useFetch<RoomEntry>('/api/room', {
    query: {
        id
    },
    onResponse: ({ response }) => {
        Object.assign(room.value, response._data);
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

        // Navigate back to the rooms page
        return navigateTo('/rooms');
    }
});

const body = computed(() => ({
    id: room.value.id,
    number: room.value.number,
    name: room.value.name,
    desc: room.value.desc
}));

// Save API request
const { execute, status } = useFetch('/api/room', {
    method: 'PATCH',
    body,
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
            description: 'Die Änderungen wurden erfolgreich gespeichert.',
            variant: 'success'
        });
        refresh();
    }
});

// Force update tag images
const { execute: forceRefreshImages, status: forceRefreshStatus } = useFetch('/api/tags/refresh', {
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
            description: 'Aktualisierungen wurde angestoßen.',
            variant: 'success'
        });
        1;
    }
});

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending' || pending.value || forceRefreshStatus.value == 'pending');

// Rerender image on update / image refresh
watch(isLoading, (value) => {
    if (!value) imageRerender.value = +Date.now();
});
</script>
