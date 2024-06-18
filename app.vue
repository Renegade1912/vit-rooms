<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <Toaster />
</template>

<script setup lang="ts">
const { data, signOut } = useAuth();
const eventSource = ref<EventSource>();

onMounted(() => {
    // Connect for Server Side Events
    eventSource.value = new EventSource(`/sse`);

    // Subscribe to userDeleted event
    eventSource.value.addEventListener('userDeleted', (evt) => {
        const { id } = JSON.parse(evt.data);

        // check if the user is the current user and logout if yes
        if (data.value?.user.id === id) signOut();
    });
});

onBeforeUnmount(() => eventSource.value?.close());
</script>
