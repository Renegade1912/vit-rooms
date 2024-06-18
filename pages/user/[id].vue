<template>
    <div>
        <PageHeader header="Benutzer" subtitle="Alle zu dem Benutzer erfassten Daten." />

        <Separator class="my-4" />

        <UsersSingleSkeleton v-if="pending" />
        <div v-else>
            <div class="col-span-2 grid content-center gap-2 md:max-w-[32rem]">
                <div class="grid grid-cols-4 items-center gap-4 py-2">
                    <Label class="text-right"> Erstellt am </Label>
                    <p class="col-span-3">{{ new Date(user.createdAt).toLocaleString() }} Uhr</p>
                </div>

                <!-- Inputs -->
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right"> Name </Label>
                    <Input id="name" class="col-span-3" v-model="user.name" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="email" class="text-right"> E-Mail </Label>
                    <Input id="email" class="col-span-3" v-model="user.email" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="password" class="break-words text-right"> Passwort </Label>
                    <Input
                        id="password"
                        type="password"
                        class="col-span-3"
                        v-model="user.password"
                        placeholder="**********"
                    />
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" @click="deleteUser(user)">Benutzer löschen</Button>
            <Button @click="execute" :disabled="isLoading" class="flex gap-x-2" ref="submit">
                <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                <span>Speichern</span></Button
            >
        </div>

        <!-- Dialogs -->
        <UsersDeleteDialog @update="navigateTo('/users')" />
    </div>
</template>

<script setup lang="ts">
import { toast } from '~/components/ui/toast';
import { useDeleteDialog } from '~/components/Users/columns';
import { useMagicKeys } from '@vueuse/core';
import { LoaderCircle } from 'lucide-vue-next';

const { open: deleteUser } = useDeleteDialog();

const { Ctrl_D, Meta_D, Ctrl_S, Meta_S } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if ((e.key === 'd' || e.key === 's') && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Ctrl_D, Meta_D], () => deleteUser(user.value));
watch([Ctrl_S, Meta_S], () => execute());

useHead({
    titleTemplate: '%s - Benutzer'
});

definePageMeta({
    category: 'users',
    breadcrumb: {
        title: 'Benutzer',
        history: [
            {
                title: 'Benutzer',
                to: '/users'
            }
        ]
    }
});

interface UserServerResponse {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: string;
}

const { id } = useRoute('user-id').params;
const user = ref<UserServerResponse>({
    id: '',
    name: '',
    email: '',
    password: '',
    createdAt: ''
});

// Fetch the user data
const { pending, error, refresh } = await useFetch<UserServerResponse>('/api/user', {
    query: {
        id
    },
    onResponse: ({ response }) => {
        Object.assign(user.value, response._data);
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

        // Navigate back to the users page
        return navigateTo('/users');
    }
});

const body = computed(() => ({
    id,
    email: user.value.email,
    name: user.value.name,
    password: user.value.password
}));

// Save API request
const { execute, status } = useFetch('/api/user', {
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

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending' || pending.value);
</script>
