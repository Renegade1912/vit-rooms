<template>
    <NuxtLink :to="`/tag/${props.tag.id}`" class="group hover:bg-secondary">
        <AlertDialog>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div :class="cn('space-y-3', $attrs.class ?? '')">
                        <div
                            class="overflow-hidden rounded-md border pb-4 transition-all group-hover:border-foreground/20"
                        >
                            <img
                                :src="`/api/tag/image/${props.tag.id}?${imageRerender}`"
                                onerror="this.src='/img/placeholder.png';this.onerror='';"
                                :alt="`Aktuelles Bild von ${props.tag.mac}`"
                                :width="width"
                                :height="height"
                                class="aspect-square h-auto w-auto object-contain p-2 transition-all group-hover:scale-105"
                            />

                            <div class="space-y-1 text-center text-sm">
                                <h3 class="font-medium leading-none">
                                    {{ props.tag.desc }}
                                </h3>
                                <p class="text-xs text-muted-foreground">
                                    {{ props.tag.mac }}
                                </p>
                            </div>
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <AlertDialogTrigger>
                        <ContextMenuItem class="flex items-center space-x-2">
                            <Unlink class="size-4 text-destructive" />
                            <p>Verlinkung aufheben</p>
                        </ContextMenuItem>
                    </AlertDialogTrigger>
                </ContextMenuContent>
            </ContextMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sind Sie sich sicher?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Wollen Sie die Verlinkung des Tags
                        <b class="text-primary">{{ props.tag.desc }}</b> wirklich aufheben?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction @click="unlinkTag">Bestätigen</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </NuxtLink>
</template>

<script setup lang="ts">
import { Unlink } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import type { Tag } from '@prisma/client';
import { useToast } from '@/components/ui/toast/use-toast';
const { toast } = useToast();

interface TagEntryProps {
    tag: Partial<Tag>;
    width: number;
    height: number;
    imageRerender: number;
}

const props = defineProps<TagEntryProps>();

const emits = defineEmits(['update']);

const unlinkTag = () =>
    $fetch('/api/tag/unlink', {
        method: 'POST',
        query: { id: props.tag.id },
        onResponseError: ({ response }) => {
            toast({
                variant: 'destructive',
                title: 'Fehler',
                description: response._data.message
            });
        },
        onResponse: ({ response }) => {
            if (!response.ok) return;

            toast({
                variant: 'success',
                title: 'Erfolgreich',
                description: 'Die Verlinkung wurde erfolgreich aufgehoben.'
            });
            emits('update');
        }
    });
</script>
