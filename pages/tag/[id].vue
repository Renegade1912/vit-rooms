<template>
    <div>
        <PageHeader header="Tag" subtitle="Alle zu dem Tag erfassten Daten." />

        <Separator class="my-4" />

        <TagsSingleSkeleton v-if="pending">Loading</TagsSingleSkeleton>
        <div v-else>
            <div class="grid grid-cols-2 gap-2 xl:grid-cols-3">
                <!-- Inputs -->
                <div class="col-span-2 grid content-center gap-2 md:max-w-[32rem]">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="mac" class="text-right"> MAC </Label>
                        <Input id="mac" class="col-span-3" v-model="tag.mac" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="desc" class="text-right"> Beschreibung </Label>
                        <Input id="desc" class="col-span-3" v-model="tag.desc" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="width" type="number" class="text-right"> Breite </Label>
                        <Input id="width" class="col-span-3" v-model="tag.width" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="height" type="number" class="text-right"> Höhe </Label>
                        <Input id="height" class="col-span-3" v-model="tag.height" />
                    </div>

                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="height" class="break-words text-right"> Raum </Label>
                        <TagsSelectRoomInput :value="tag.room" class="col-span-3" @update="updateSelectedRoom" />
                    </div>
                </div>

                <!-- Image -->
                <div class="col-span-2 flex flex-col items-center justify-center xl:col-span-1">
                    <Separator class="my-4 xl:hidden" />
                    <h2 class="text-md mb-4 font-semibold tracking-tight">Aktuell bekanntes Bild</h2>
                    <img
                        :src="`/api/tag/image/${tag.id}?${imageRerender}`"
                        onerror="this.src='/img/placeholder.png';this.onerror='';"
                        :alt="`Aktuelles Bild von ${tag.mac}`"
                        :width="tag.width"
                        :height="tag.height"
                        class="h-auto w-auto rounded-md border bg-secondary object-contain"
                    />

                    <div class="mt-4">
                        <Button
                            variant="secondary"
                            class="flex items-center justify-center space-x-2"
                            @click="forceRefreshImage"
                            :disabled="isLoading"
                        >
                            <RefreshCcw
                                :class="cn('size-4', forceRefreshStatus === 'pending' && 'animate-spin duration-1500')"
                            />
                            <span>Bild aktualisieren</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" @click="deleteTag(tag)" :disabled="isLoading">Tag löschen</Button>
            <Button @click="execute" :disabled="isLoading" class="flex gap-x-2" ref="submit">
                <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                <span>Speichern</span></Button
            >
        </div>

        <!-- Dialogs -->
        <TagsDeleteDialog @update="navigateTo('/tags')" />
    </div>
</template>

<script setup lang="ts">
import { LoaderCircle, RefreshCcw } from 'lucide-vue-next';
import { useMagicKeys } from '@vueuse/core';
import { type RoomEntry } from '~/components/Rooms/columns';
import { useDeleteDialog, type TagTableEntry } from '~/components/Tags/columns';
import { toast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';

const { open: deleteTag } = useDeleteDialog();

const { Ctrl_D, Meta_D, Ctrl_S, Meta_S } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if ((e.key === 'd' || e.key === 's') && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});
watch([Ctrl_D, Meta_D], () => deleteTag(tag.value));
watch([Ctrl_S, Meta_S], () => execute());

useHead({
    titleTemplate: '%s - Tag'
});

definePageMeta({
    category: 'tags',
    breadcrumb: {
        title: 'Tag',
        history: [
            {
                title: 'Tags',
                to: '/tags'
            }
        ]
    }
});

// Update parent list on successful create
const emits = defineEmits(['update']);

const { id } = useRoute('tag-id').params;
const tag = ref<TagTableEntry>({
    id: '',
    mac: '',
    desc: '',
    width: 0,
    height: 0
});
const imageRerender = ref(+Date.now());

// Fetch the tag data
const { pending, error, refresh } = await useFetch<TagTableEntry>('/api/tag', {
    query: {
        id
    },
    onResponse: ({ response }) => {
        Object.assign(tag.value, response._data);
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
        return navigateTo('/tags');
    }
});

const updateSelectedRoom = (value: RoomEntry) => {
    tag.value.room = value;
};

// Make api body responsive to form data changes
const body = computed(() => ({
    id: tag.value.id,
    mac: tag.value.mac,
    desc: tag.value.desc,
    width: tag.value.width,
    height: tag.value.height,
    roomId: tag.value.room?.id ?? ''
}));

const showError = (msg: string) =>
    toast({
        title: 'Fehler',
        description: msg,
        variant: 'destructive'
    });

// Save API request
const { execute, status } = useFetch('/api/tag', {
    method: 'PATCH',
    body,
    immediate: false,
    watch: false,
    onResponse: ({ response }) => {
        if (!response.ok) {
            showError(response._data.message);
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

// Force update tag image
const { execute: forceRefreshImage, status: forceRefreshStatus } = useFetch('/api/tag/refresh', {
    method: 'POST',
    query: {
        id
    },
    immediate: false,
    watch: false,
    onResponse: ({ response }) => {
        if (!response.ok) {
            showError(response._data.message);
            return;
        }

        toast({
            title: 'Erfolgreich',
            description: 'Aktualisierung wurde angestoßen.',
            variant: 'success'
        });
    }
});

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending' || forceRefreshStatus.value == 'pending' || pending.value);

// Rerender image on update / image refresh
watch(isLoading, (value) => {
    if (!value) imageRerender.value = +Date.now();
});
</script>
