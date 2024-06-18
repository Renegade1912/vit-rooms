<template>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card v-for="i in 4">
            <CardHeader class="flex flex-row items-center gap-x-2 pb-2">
                <Skeleton class="h-6 flex-1" />
                <Skeleton class="h-6 w-6" />
            </CardHeader>
            <CardContent>
                <Skeleton class="h-8 w-[80%]" />
            </CardContent>
        </Card>
    </div>
</template>
