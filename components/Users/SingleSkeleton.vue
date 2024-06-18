<template>
    <div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <div class="grid content-start gap-2 md:max-w-[32rem]">
            <div class="grid grid-cols-4 items-center gap-4" v-for="i in 4">
                <Skeleton class="h-8" />
                <Skeleton class="col-span-3 h-10" />
            </div>
        </div>
    </div>
</template>
