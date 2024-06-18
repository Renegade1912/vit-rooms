<template>
    <NuxtLink :to="props.link">
        <div
            :class="
                cn(
                    'group flex h-9 w-full items-center justify-start rounded-md px-4 py-2 text-sm font-medium text-secondary-foreground opacity-75 transition hover:bg-secondary hover:opacity-100',

                    isActive && 'bg-primary/80 opacity-100 hover:bg-primary/80'
                )
            "
            :disabled="isActive"
        >
            <div
                :class="
                    cn(
                        'mr-2 flex h-4 w-4 items-center justify-center transition group-hover:scale-125',
                        isActive && 'group-hover:scale-100'
                    )
                "
            >
                <slot name="icon" />
            </div>

            <span>{{ props.title }}</span>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils';

interface Props {
    link: string;
    title: string;
    category: string;
}
const props = defineProps<Props>();

const isActive = computed(() => {
    const route = useRoute();

    // Check if the current route is a child of the link by meta tag category
    return route.meta.category === props.category;
});
</script>
