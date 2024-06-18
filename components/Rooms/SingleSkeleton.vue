<template>
    <div>
        <div class="grid grid-cols-2 gap-2 lg:grid-cols-3">
            <!-- Inouts -->
            <div class="col-span-2 grid content-center gap-2 md:max-w-[32rem]">
                <div class="grid grid-cols-4 items-center gap-4" v-for="i in 3">
                    <Skeleton class="h-8" />
                    <Skeleton class="col-span-3 h-10" />
                </div>
            </div>

            <div class="hidden flex-col items-center justify-center place-self-center lg:flex">
                <Skeleton class="mb-0.5 h-40 w-40" />
            </div>
        </div>

        <!-- Events mobile -->
        <div class="flex flex-col lg:hidden">
            <Separator class="my-4" />
            <div class="flex items-center py-2 lg:hidden">
                <Skeleton class="h-8 w-60" />
            </div>
        </div>

        <Separator class="my-4" />

        <!-- Linked Tags -->
        <div>
            <div class="mb-4 flex items-center">
                <div class="space-y-1">
                    <Skeleton class="h-8 w-16" />
                    <Skeleton class="h-6 w-72" />
                </div>
            </div>

            <Skeleton class="h-[150px] w-[150px]" />
        </div>
    </div>
</template>
