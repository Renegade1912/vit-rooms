<template>
    <div class="flex justify-center gap-x-4">
        <Button v-if="showEdit" variant="ghost" class="h-4 w-4 p-0" @click="editFunc">
            <span class="sr-only">Editieren</span>
            <Pencil class="h-4 w-4 hover:text-primary" />
        </Button>
        <Button v-if="showView" variant="ghost" class="h-4 w-4 p-0" @click="showFunc">
            <span class="sr-only">Anzeigen</span>
            <Eye class="h-4 w-4 hover:text-primary" />
        </Button>
        <Button v-if="showDelete" variant="ghost" class="h-4 w-4 p-0" @click="deleteFunc">
            <span class="sr-only">Löschen</span>
            <Trash2 class="h-4 w-4 hover:text-destructive" />
        </Button>
    </div>
</template>

<script setup lang="ts">
import { Trash2, Pencil, Eye } from 'lucide-vue-next';

withDefaults(
    defineProps<{
        showEdit?: boolean;
        showDelete?: boolean;
        showView?: boolean;
        editFunc?: () => void;
        showFunc?: () => void;
        deleteFunc?: () => void;
    }>(),
    {
        showEdit: true,
        showDelete: true,
        showView: false
    }
);
</script>
