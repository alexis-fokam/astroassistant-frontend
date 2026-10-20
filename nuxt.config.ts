import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'AstroVitals',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'description', content: 'AstroVitals — On-Device Autonomous Health Companion' },
        { name: 'theme-color', content: '#0B1220' },
      ],
    },
  },
})
