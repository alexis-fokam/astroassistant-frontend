import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Backend URL; override with NUXT_PUBLIC_API_BASE (e.g. on the deployed demo).
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api/v1',
    },
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: 'Astro Assistant',
      htmlAttrs: { lang: 'fr' },
      meta: [
        {
          name: 'description',
          content: 'Astro Assistant — le médecin de bord intelligent, embarqué et hors ligne.',
        },
        { name: 'theme-color', content: '#ffffff' },
      ],
    },
  },
})
