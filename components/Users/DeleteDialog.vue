<template>
    <Dialog :open="isOpen" @update:open="handleOpen">
        <DialogContent @interact-outside="(event) => event.preventDefault()">
            <!-- Dialog Header -->
            <DialogHeader>
                <DialogTitle>Sind Sie sich sicher?</DialogTitle>
                <DialogDescription>
                    <div>
                        Wollen Sie den Benutzer <b class="text-primary">{{ user?.name }}</b> wirklich löschen?
                    </div>
                    <div class="my-6 font-thin text-red-500">
                        <b>Diese Aktion kann nicht rückgängig gemacht werden!</b>
                    </div>
                </DialogDescription>
            </DialogHeader>

            <!-- Dialog Actions -->
            <DialogFooter class="flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" @click="close" :disabled="isLoading">Abbrechen</Button>
                <Button @click="execute" :disabled="isLoading" class="flex gap-x-2" ref="submit">
                    <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                    <span>Löschen</span>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import { useDeleteDialog } from '~/components/Users/columns';
import { useToast } from '@/components/ui/toast/use-toast';
import { useFocus } from '@vueuse/core';
const { isOpen, close, user } = useDeleteDialog();
const { toast } = useToast();

// Update parent list on successful delete
const emits = defineEmits(['update']);

// Focus submit button on open
const submit = ref<HTMLInputElement | null>(null);
useFocus(submit, { initialValue: true });

// Make api body responsive to handle no user on init
const body = computed(() => ({
    id: user.value?.id
}));

// API request
const { execute, status } = useFetch('/api/user', {
    method: 'DELETE',
    body,
    immediate: false,
    watch: false,
    onResponse({ response }) {
        toast({
            variant: response.ok ? 'success' : 'destructive',
            title: response.ok ? 'Erfolgreich' : 'Fehler',
            description: response.ok
                ? h('span', null, [
                      'Der Benutzer ',
                      h('b', null, `${user.value?.name}`),
                      ' wurde erfolgreich gelöscht.'
                  ])
                : response._data.message
        });

        emits('update');
        close();
    }
});

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending');

// Handle dialog x button
function handleOpen(value: boolean) {
    if (value) {
        return;
    }

    close();
}
</script>
