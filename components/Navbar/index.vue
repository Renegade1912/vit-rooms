<template>
    <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div class="container flex h-14 max-w-screen-2xl items-center px-4 lg:px-8">
            <!-- "Logo" -->
            <div class="mr-4 hidden md:flex">
                <NuxtLink to="/" class="mr-4 lg:mr-6" alt="Link zur Startseite">
                    <p class="font-bold">VIT - Raumplanung</p>
                </NuxtLink>
                <nav class="flex items-center space-x-6 text-sm font-medium max-lg:space-x-4">
                    <!-- Top Left Nav Items [Optional] -->
                </nav>
            </div>

            <!-- Mobile Sidebar (Burger-Button) -->
            <MobileSidebar />

            <!-- Right Nav Menu -->
            <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <!-- Quickstart Bar -->
                <NavbarSearch />

                <!-- Right Nav Items -->
                <nav class="flex items-center">
                    <!-- Only render on client side -->
                    <ClientOnly>
                        <!-- Dark Mode Toggle -->
                        <Button size="icon" @click="toggleDarkMode" variant="ghost">
                            <SunMedium class="h-5 w-5" v-if="colorMode.preference === 'dark'" />
                            <MoonStar class="h-5 w-5" v-else />
                            <span class="sr-only">Dark Mode umschalten</span>
                        </Button>

                        <!-- Help -->
                        <HelpDialog />

                        <!-- Logout -->
                        <Button size="icon" @click="signOut" variant="ghost">
                            <LogOut class="-h5 w-5 text-destructive" />
                            <span class="sr-only">Abmelden</span>
                        </Button>
                    </ClientOnly>
                </nav>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { LogOut, SunMedium, MoonStar } from 'lucide-vue-next';
const { signOut } = useAuth();
const colorMode = useColorMode();

const toggleDarkMode = () => {
    colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light';
};
</script>
