// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';
import {definePreset} from "@primeuix/themes";


const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{orange.50}',
            100: '{orange.100}',
            200: '{orange.200}',
            300: '{orange.300}',
            400: '{orange.400}',
            500: '{orange.500}',
            600: '{orange.600}',
            700: '{orange.700}',
            800: '{orange.800}',
            900: '{orange.900}',
            950: '{orange.950}'
        }
    }
});

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: ['@primevue/nuxt-module', '@nuxt/fonts', '@pinia/nuxt'],
    primevue: {
        options: {
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: 'light',
                }
            }
        }
    },
    nitro: {
        experimental: {
            websocket: true
        }
    },
    sourcemap: {
        server: true,
        client: true
    },
    css: ["primeicons/primeicons.css"]
})