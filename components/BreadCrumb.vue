<template>
    <Breadcrumb class="mb-4">
        <BreadcrumbList>
            <!-- Default Home -->
            <BreadcrumbItem>
                <BreadcrumbLink>
                    <NuxtLink to="/">
                        <Home class="h-4 w-4" />
                    </NuxtLink>
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <!-- History -->
            <template v-for="item in props.history">
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <NuxtLink class="capitalize" :to="item.to">{{ item.title }}</NuxtLink>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
            </template>

            <!-- Current Page -->
            <BreadcrumbItem>
                <BreadcrumbLink class="capitalize text-foreground hover:text-foreground">
                    {{ props.title }}
                </BreadcrumbLink>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
</template>

<script setup lang="ts">
import { Home } from 'lucide-vue-next';

interface BreadcrumbItem {
    title?: string;
    to: string;
}

export interface BreadcrumbProps {
    history?: BreadcrumbItem[];
    title: string;
}

const props = defineProps<BreadcrumbProps>();
</script>
