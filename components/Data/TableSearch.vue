<template>
    <div class="relative w-full items-center">
        <Input
            @update:model-value="updateFilter"
            id="search"
            type="text"
            placeholder="Filtern..."
            ref="search"
            class="pl-10"
        />
        <span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
            <Search class="size-6 text-muted-foreground" />
        </span>
    </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { useDebounceFn, useFocus, useMagicKeys } from '@vueuse/core';

const filter = ref<string>('');
const emits = defineEmits(['update:filter']);

const search = ref<HTMLInputElement | null>(null);
const { focused } = useFocus(search);

const { Ctrl_F, Meta_F } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === 'f' && (e.metaKey || e.ctrlKey)) e.preventDefault();
    }
});

watch([Ctrl_F, Meta_F], () => (focused.value = true));

const updateFilter = useDebounceFn(
    (value) => {
        filter.value = value;
        emits('update:filter', value);
    },
    600,
    { maxWait: 1500 }
);
</script>
