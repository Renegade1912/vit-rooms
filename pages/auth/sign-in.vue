<template>
    <div>
        <!-- height calc: screen height - footer - border 1px -->
        <div class="flex h-[calc(100vh-3rem-1px)] flex-col justify-center px-6 py-12 lg:px-8">
            <div class="flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="/logo.svg" alt="Logo" class="w-full px-14 md:w-2/3 md:px-0" />
                <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Anmelden</h2>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form class="space-y-6" @submit="onSubmit">
                    <FormField v-slot="{ componentField }" name="name">
                        <FormItem>
                            <FormLabel>Benutzername</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="vorname.nachname" v-bind="componentField"></Input>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="password">
                        <FormItem>
                            <FormLabel>Passwort</FormLabel>

                            <FormControl>
                                <Input type="password" placeholder="********" v-bind="componentField"></Input>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <Button type="submit" class="w-full">Anmelden</Button>
                </form>

                <p class="mt-10 text-center text-sm text-secondary-foreground">
                    Noch nicht registiert?
                    <span class="font-semibold text-primary">Schade ;)</span>
                </p>
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from '@/components/ui/toast/use-toast';
import { useForm } from 'vee-validate';
import * as z from 'zod';

useHead({
    titleTemplate: '%s - Anmeldung'
});

const { signIn } = useAuth();
const { toast } = useToast();

definePageMeta({
    layout: 'auth',
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/'
    }
});

const formSchema = toTypedSchema(
    z.object({
        name: z.string({
            required_error: 'Sie müssen einen Namen angeben!'
        }),
        password: z.string({
            required_error: 'Sie müssen ein Passwort angeben!'
        })
    })
);
const form = useForm({ validationSchema: formSchema });

const onSubmit = form.handleSubmit(async (values) => {
    const { name, password } = values;
    // @ts-ignore - We know that the error and url properties are available
    const { error, url } = await signIn('credentials', { name, password, redirect: false });

    if (error) {
        toast({
            title: 'Fehlgeschlagen!',
            description:
                'Die Anmeldung ist fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.',
            variant: 'destructive'
        });
        return;
    }

    return navigateTo(url, { external: true });
});
</script>
