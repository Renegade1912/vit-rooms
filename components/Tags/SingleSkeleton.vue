<template>
    <div class="grid grid-cols-2 gap-2 xl:grid-cols-3">
        <div class="col-span-2 grid content-center gap-2 md:max-w-[32rem]">
            <div class="grid grid-cols-4 items-center gap-4" v-for="i in 5">
                <Skeleton class="h-8" />
                <Skeleton class="col-span-3 h-10" />
            </div>
        </div>

        <div class="col-span-2 flex flex-col items-center justify-center xl:col-span-1">
            <Skeleton class="h-full w-full" />
        </div>
    </div>
</template>
