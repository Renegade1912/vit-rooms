<template>
    <div>
        <!-- Header -->
        <PageHeader
            header="Herzlich Willkommen"
            subtitle="Die VIT Raumplanung ermöglicht Ihnen eine intuitive Verwaltung von Räumen, Kalendern, Terminen und OpenEPaperLink Tags."
        />

        <!-- Dashboard -->
        <HomeDashboard />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    category: 'home'
});
</script>
