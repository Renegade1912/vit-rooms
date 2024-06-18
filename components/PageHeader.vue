<template>
    <div class="mb-4 space-y-2">
        <h1 class="scroll-m-20 text-4xl font-bold tracking-tight">{{ header }}</h1>
        <p class="text-lg text-muted-foreground">{{ subtitle }}</p>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    header: string;
    subtitle?: string;
}>();
</script>
