<template>
    <Dialog :open="isOpen" @update:open="handleOpen">
        <DialogContent @interact-outside="(event) => event.preventDefault()">
            <!-- Dialog Header -->
            <DialogHeader>
                <DialogTitle>Neuen Raum erstellen</DialogTitle>
                <DialogDescription>
                    Füllen Sie die folgenden Felder aus, um einen neuen Raum zu erstellen.
                </DialogDescription>
            </DialogHeader>

            <!-- Dialog Content -->
            <div class="grid gap-4 pt-4" :class="{ 'pb-4': !error }">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="number" class="text-right"> Nummer* </Label>
                    <Input
                        id="number"
                        placeholder="4"
                        class="col-span-3"
                        v-model="formData.number"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right"> Name* </Label>
                    <Input
                        id="name"
                        placeholder="Lehrsaal 4"
                        class="col-span-3"
                        v-model="formData.name"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="desc" class="break-words text-right"> Beschreibung </Label>
                    <Input
                        id="desc"
                        placeholder="Standard Lehrsaal für H3 - Kurs 1"
                        class="col-span-3"
                        v-model="formData.desc"
                        @keyup.enter="execute"
                    />
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
import { useCreateDialog } from '~/components/Rooms/columns';
import { useToast } from '@/components/ui/toast/use-toast';
const { isOpen, close } = useCreateDialog();
const { toast } = useToast();

// Update parent list on successful create
const emits = defineEmits(['update']);

const formData = ref({ number: '', name: '', desc: '' });
const error = ref<string | null>(null);

// Make api body responsive to form data changes
const body = computed(() => ({
    number: formData.value.number,
    name: formData.value.name,
    desc: formData.value.desc
}));

// API request
const { execute, status } = useFetch('/api/room', {
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
                'Der Raum ',
                h('b', null, `${formData.value.name} (${formData.value.number})`),
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

    formData.value = { number: '', name: '', desc: '' };
    error.value = null;
});

// Handle dialog x button
function handleOpen(value: boolean) {
    if (value) return;

    close();
}
</script>
