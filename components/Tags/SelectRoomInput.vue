<template>
    <div :class="$attrs.class ?? ''">
        <Popover v-model:open="open">
            <PopoverTrigger as-child>
                <Button variant="outline" role="combobox" :aria-expanded="open" class="w-full justify-between">
                    <div>
                        {{ value ? rooms?.find((room) => room.id === value?.id)?.name : 'Raum auswählen...' }}
                    </div>

                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
                <Command @update:search-term="updateFilter">
                    <CommandInput placeholder="Raum suchen..." />
                    <CommandEmpty>Keinen Raum gefunden.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem v-for="room in rooms" :key="room.id" :value="room" @select="onSelect(room)">
                                <Check
                                    :class="cn('mr-2 h-4 w-4', value?.id === room.id ? 'opacity-100' : 'opacity-0')"
                                />
                                {{ room?.name }}
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
</template>

<script setup lang="ts">
import { ChevronsUpDown, Check } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';
import type { RoomEntry } from '../Rooms/columns';
import { cn } from '~/lib/utils';

const props = defineProps<{
    value: Partial<RoomEntry> | null | undefined;
}>();
const emits = defineEmits(['update']);

const open = ref(false);
const search = ref<string>('');

const filter = computed(() => search.value);

const updateFilter = useDebounceFn(
    (value) => {
        search.value = value;
        execute();
    },
    600,
    { maxWait: 1500 }
);

const onSelect = (room: RoomEntry) => {
    open.value = false;
    emits('update', room.id === props.value?.id ? null : room);
};

const { data: rooms, execute } = await useFetch<RoomEntry[]>('/api/rooms/search', {
    query: {
        filter
    },
    method: 'GET',
    lazy: true,
    server: false,
    immediate: true,
    watch: false
});
</script>
