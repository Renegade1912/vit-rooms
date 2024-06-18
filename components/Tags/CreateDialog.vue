<template>
    <Dialog :open="isOpen" @update:open="handleOpen">
        <DialogContent @interact-outside="(event) => event.preventDefault()">
            <!-- Dialog Header -->
            <DialogHeader>
                <DialogTitle>Neuen Tag erstellen</DialogTitle>
                <DialogDescription>
                    Füllen Sie die folgenden Felder aus, um einen neuen Tag zu erstellen.
                </DialogDescription>
            </DialogHeader>

            <!-- Dialog Content -->
            <div class="grid gap-4 pt-4" :class="{ 'pb-4': !error }">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="mac" class="text-right"> MAC </Label>
                    <Input
                        id="mac"
                        placeholder="12:34:56:12:34:56"
                        class="col-span-3"
                        v-model="formData.mac"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="desc" class="text-right"> Beschreibung </Label>
                    <Input
                        id="desc"
                        placeholder='7.4" Tag'
                        class="col-span-3"
                        v-model="formData.desc"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="width" class="break-words text-right"> Breite </Label>
                    <Input
                        type="number"
                        id="width"
                        placeholder="640"
                        class="col-span-3"
                        v-model="formData.width"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="height" class="break-words text-right"> Höhe </Label>
                    <Input
                        type="number"
                        id="height"
                        placeholder="384"
                        class="col-span-3"
                        v-model="formData.height"
                        @keyup.enter="execute"
                    />
                </div>

                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="height" class="break-words text-right"> Raum </Label>
                    <TagsSelectRoomInput :value="formData.room" class="col-span-3" @update="updateSelectedRoom" />
                </div>
            </div>

            <!-- Error -->
            <Alert v-if="error" variant="destructive" class="mb-4">
                <AlertCircle class="size-5" />
                <AlertTitle>Fehler!</AlertTitle>
                <AlertDescription> {{ error }} </AlertDescription>
            </Alert>

            <!-- Dialog Actions -->
            <DialogFooter class="flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" @click="close" :disabled="isLoading">Abbrechen</Button>
                <Button @click="execute" :disabled="isLoading" class="flex gap-x-2">
                    <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                    <span>Erstellen</span>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { LoaderCircle, AlertCircle } from 'lucide-vue-next';
import { useCreateDialog } from '~/components/Tags/columns';
import { useToast } from '@/components/ui/toast/use-toast';
import type { RoomEntry } from '../Rooms/columns';
const { isOpen, close } = useCreateDialog();
const { toast } = useToast();

// Update parent list on successful create
const emits = defineEmits(['update']);

interface TagForm {
    mac: string | null;
    desc: string | null;
    width: number;
    height: number;
    room: RoomEntry | null;
}

const formData: Ref<TagForm> = ref({ mac: null, desc: null, width: 0, height: 0, room: null });
const error = ref<string | null>(null);

const updateSelectedRoom = (value: RoomEntry) => {
    formData.value.room = value;
};

// Make api body responsive to form data changes
const body = computed(() => ({
    mac: formData.value.mac,
    desc: formData.value.desc,
    width: formData.value.width,
    height: formData.value.height,
    roomId: formData.value.room?.id
}));

// API request
const { execute, status } = useFetch('/api/tag', {
    method: 'POST',
    body,
    immediate: false,
    watch: false,
    onResponseError: ({ response }) => {
        error.value = response._data.message;
    },
    onResponse({ response }) {
        if (!response.ok) return;

        toast({
            variant: 'success',
            title: 'Erfolgreich',
            description: h('span', null, [
                'Der Tag ',
                h('b', null, `${formData.value.desc} (${formData.value.mac})`),
                ' wurde erfolgreich erstellt.'
            ])
        });
        emits('update');
        close();
    }
});

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending');

// Reset form data on dialog close
watch(isOpen, (value) => {
    if (value) return;

    formData.value = { mac: null, desc: null, width: 0, height: 0, room: null };
    error.value = null;
});

// Handle dialog x button
function handleOpen(value: boolean) {
    if (value) return;

    close();
}
</script>
