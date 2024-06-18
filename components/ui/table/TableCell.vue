<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
    colSpan?: number;
}>();
</script>

<template>
    <td :colspan="props.colSpan" :class="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', props.class)">
        <slot />
    </td>
</template>
