import { copySync } from 'fs-extra';

export default defineNuxtConfig({
    hooks: {
        'nitro:build:public-assets': async (builder) => {
            // As long we are using SQLite, we want to copy the current database file to the build server folder
            if (!process.env.DATABASE_URL?.includes('file:')) return;

            const databasePath = process.env.DATABASE_URL.replace('file:', '');
            copySync(`./prisma/${databasePath}`, `${builder.options.output.serverDir}/prisma/${databasePath}`);
        }
    },
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/tailwindcss',
        'shadcn-nuxt',
        'nuxt-typed-router',
        '@nuxt/image',
        '@pinia/nuxt',
        'nuxt-cron',
        '@sidebase/nuxt-auth',
        '@nuxtjs/color-mode'
    ],
    runtimeConfig: {
        authSecret: process.env.AUTH_SECRET
    },
    app: {
        head: {
            title: 'VIT - Raumplanung',
            charset: 'utf-16',
            htmlAttrs: {
                lang: 'de'
            },
            meta: [
                { name: 'Content-Language', content: 'de' },
                { name: 'page-topic', content: 'Management, Raumplanung, Tags' },
                { name: 'application-name', content: 'VIT - Raumplanung' }
            ]
        }
    },
    auth: {
        provider: {
            type: 'authjs'
        },
        globalAppMiddleware: true
    },
    imports: {
        dirs: ['./stores']
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui'
    },
    colorMode: {
        classSuffix: ''
    },
    cron: {
        runOnInit: false,
        timeZone: 'Europe/Berlin',
        jobsDir: 'cron'
    }
});
