<template>
    <div>
        <Dialog :open="isOpen" @update:open="handleOpen">
            <DialogTrigger>
                <!-- Dialog Open Button -->
                <Button size="icon" variant="ghost">
                    <MessageCircleQuestion class="h-5 w-5" />
                    <span class="sr-only">Hilfe</span>
                </Button>
            </DialogTrigger>

            <DialogContent>
                <!-- Dialog Header -->
                <DialogHeader>
                    <DialogTitle>Hilfe</DialogTitle>
                    <DialogDescription> Erhalten Sie nützliche Informationen über diese Website.</DialogDescription>
                </DialogHeader>

                <div>
                    <h1 class="text-sm font-bold">Abkürzungen</h1>
                    <p class="text-sm">
                        Die Website unterstützt untrschiedluche Abkürzungen, um die Navigation zu erleichtern. Hier sind
                        einige der wichtigsten Abkürzungen:
                    </p>
                    <ul class="mt-4 list-inside list-disc text-sm font-thin text-foreground">
                        <li>
                            <strong>⌘ + J</strong> - Öffnet das Menü, um zwischen den verschiedenen Ansichten zu
                            wechseln.
                        </li>
                        <li>
                            <strong>⌘ + F</strong> - Fokusiert die Suchleiste, um schnell nach Inhalten zu suchen
                            (Listenansicht).
                        </li>
                        <li>
                            <strong>⌘ + Q</strong> - Öffnet den Dialog zum Erstellen eines neuen Elements
                            (Listenansicht).
                        </li>
                        <li><strong>⌘ + S</strong> - Speichert das aktuelle Element (Detailansicht).</li>
                        <li><strong>⌘ + D</strong> - Löscht das aktuelle Element (Detailansicht).</li>
                    </ul>
                </div>

                <!-- Dialog Content -->
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { MessageCircleQuestion } from 'lucide-vue-next';

const isOpen = ref(false);

function handleOpen(value: boolean) {
    isOpen.value = value;
}
</script>
