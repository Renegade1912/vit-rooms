<template>
    <Dialog :open="isOpen" @update:open="handleOpen">
        <DialogContent @interact-outside="(event) => event.preventDefault()">
            <!-- Dialog Header -->
            <DialogHeader>
                <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
                <DialogDescription>
                    Füllen Sie die folgenden Felder aus, um einen neuen Benutzer zu erstellen.
                </DialogDescription>
            </DialogHeader>

            <!-- Dialog Content -->
            <div class="grid gap-4 pt-4" :class="{ 'pb-4': !error }">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right"> Name </Label>
                    <Input
                        id="name"
                        placeholder="Max Mustermann"
                        class="col-span-3"
                        v-model="formData.name"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="email" class="text-right"> E-Mail </Label>
                    <Input
                        id="email"
                        placeholder="max.mustermann@vit-bund.de"
                        class="col-span-3"
                        v-model="formData.email"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="password" class="text-right"> Passwort </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Passwort"
                        class="col-span-3"
                        v-model="formData.password"
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
import { useCreateDialog } from '~/components/Users/columns';
import { useToast } from '@/components/ui/toast/use-toast';
import type { UserTableEntry } from '~/components/Users/columns';
const { isOpen, close } = useCreateDialog();
const { toast } = useToast();

// Update parent list on successful create
const emits = defineEmits(['update']);

interface UserForm {
    name: string;
    email: string;
    password: string;
}

const formData: Ref<UserForm> = ref({ name: '', email: '', password: '' });
const error = ref<string | null>(null);

// Make api body responsive to form data changes
const body = computed(() => ({
    name: formData.value.name,
    email: formData.value.email,
    password: formData.value.password
}));

// API request
const { execute, status } = useFetch('/api/user', {
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
                'Der Benutzer ',
                h('b', null, `${formData.value.name}`),
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
    if (!value) {
        formData.value = { name: '', email: '', password: '' };
        error.value = null;
    }
});

// Handle dialog x button
function handleOpen(value: boolean) {
    if (value) {
        return;
    }

    close();
}
</script>
