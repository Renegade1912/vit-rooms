<template>
    <main class="h-full">
        <!-- Navbar top -->
        <Navbar />

        <!-- Main content -->
        <div class="border-b">
            <div
                class="container flex-1 items-start px-4 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:px-8"
            >
                <!-- Sidebar left -->
                <Sidebar />

                <!-- Page -->
                <div class="py-6 lg:py-8">
                    <ClientOnly>
                        <BreadCrumb v-if="breadcrumbs" :title="breadcrumbs?.title" :history="breadcrumbs?.history" />
                        <slot />
                    </ClientOnly>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <Footer />
    </main>
</template>

<script setup lang="ts">
import type { BreadcrumbProps } from '~/components/BreadCrumb.vue';

const route = useRoute();

const breadcrumbs = computed(() => {
    return route.meta.breadcrumb as BreadcrumbProps | null;
});
</script>
