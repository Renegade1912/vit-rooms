<template>
    <Dialog :open="isOpen" @update:open="handleOpen">
        <DialogContent @interact-outside="(event) => event.preventDefault()">
            <!-- Dialog Header -->
            <DialogHeader>
                <DialogTitle>Neuen Kalender erstellen</DialogTitle>
                <DialogDescription>
                    Füllen Sie die folgenden Felder aus, um einen neuen Kalender zu erstellen. Das Löschdatum ist
                    optional und markiert den Zeitpunkt, an dem der Kalender automatisch gelöscht wird.
                </DialogDescription>
            </DialogHeader>

            <!-- Dialog Content -->
            <div class="grid gap-4 pt-4" :class="{ 'pb-4': !error }">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right"> Name* </Label>
                    <Input
                        id="name"
                        placeholder="Stundenplan VIT 2021/2 - H3 - Kurs 1"
                        class="col-span-3"
                        v-model="formData.name"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="url" class="text-right"> URL* </Label>
                    <Input
                        id="url"
                        placeholder="https://www.fbfinanzen.de/ical/vit/2021/2/h3/k01"
                        class="col-span-3"
                        v-model="formData.url"
                        @keyup.enter="execute"
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="delete_on" class="text-right"> Löschdatum </Label>
                    <Popover v-model:open="isCalendarOpen">
                        <PopoverTrigger as-child>
                            <Button
                                variant="outline"
                                :class="
                                    cn(
                                        'col-span-3 justify-start text-left font-normal',
                                        !formData.delete_on && 'text-muted-foreground'
                                    )
                                "
                            >
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                {{
                                    formData.delete_on
                                        ? df.format(formData.delete_on.toDate(getLocalTimeZone()))
                                        : 'Datum auswählen'
                                }}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0">
                            <Calendar
                                v-model="formData.delete_on"
                                initial-focus
                                @update:modelValue="isCalendarOpen = false"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <!-- Error -->
            <Alert v-if="error" variant="destructive" class="mb-4">
                <AlertCircle class="size-5" />
                <AlertTitle>Fehler!</AlertTitle>
                <AlertDescription> {{ error }} </AlertDescription>
            </Alert>

            <!-- Dialog Actions -->
            <DialogFooter class="flex flex-col justify-normal gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" @click="close" :disabled="isLoading">Abbrechen</Button>
                <Button @click="execute" :disabled="isLoading" class="flex gap-x-2">
                    <LoaderCircle class="size-5 animate-spin duration-1500" v-if="isLoading" />
                    <span>Erstellen</span>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { LoaderCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-vue-next';
import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
import { useCreateDialog } from '~/components/Calendars/columns';
import { useToast } from '@/components/ui/toast/use-toast';
import { cn } from '~/lib/utils';
const { isOpen, close } = useCreateDialog();
const { toast } = useToast();

const df = new DateFormatter('de-DE', {
    dateStyle: 'medium'
});

const isCalendarOpen = ref(false);

// Update parent list on successful create
const emits = defineEmits(['update']);

const formData = ref<{ name: string; url: string; delete_on: DateValue | null }>({
    name: '',
    url: '',
    delete_on: null
});
const error = ref<string | null>(null);

// Make api body responsive to form data changes
const body = computed(() => ({
    name: formData.value.name,
    url: formData.value.url,
    delete_on: formData.value.delete_on?.toDate(getLocalTimeZone())
}));

// API request
const { execute, status } = useFetch('/api/calendar', {
    method: 'POST',
    body,
    immediate: false,
    watch: false,
    onResponseError: ({ response }) => {
        error.value = response._data.message;
    },
    onResponse({ response }) {
        if (!response.ok) return;

        toast({
            variant: 'success',
            title: 'Erfolgreich',
            description: h('span', null, [
                'Der Raum ',
                h('b', null, `${formData.value.name}`),
                ' wurde erfolgreich erstellt.'
            ])
        });
        emits('update');
        close();
    }
});

// Computed state of API loading
const isLoading = computed(() => status.value == 'pending');

// Reset form data on dialog close
watch(isOpen, (value) => {
    if (value) return;

    formData.value = { name: '', url: '', delete_on: null };
    error.value = null;
});

// Handle dialog x button
function handleOpen(value: boolean) {
    if (value) return;

    close();
}
</script>
