<script setup lang="ts">
import { Code, Github, Play, Rocket } from 'lucide-vue-next'
import { API_DOCS_URL, FOOTER_COLUMNS, REPOSITORY_URL, SITE_LINKS } from '~/constants/site'

// Public website shell (Figma P-02, P-03): top navigation and dark footer.
const route = useRoute()
const language = ref('fr')
const LANGUAGES = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
]
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-surface">
    <header class="sticky top-0 z-30 border-b border-divider bg-surface/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <BrandLogo />
        <nav aria-label="Site" class="ml-4 hidden items-center gap-1 lg:flex">
          <NuxtLink
            v-for="link in SITE_LINKS"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="route.path === link.to ? 'text-primary' : 'text-ink hover:text-primary'"
            :aria-current="route.path === link.to ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="ml-auto flex items-center gap-2">
          <UiButton variant="ghost" size="sm" :icon="Code" :to="API_DOCS_URL" class="hidden md:inline-flex">
            Docs API
          </UiButton>
          <UiButton
            variant="secondary"
            size="sm"
            :icon="Github"
            :to="REPOSITORY_URL"
            class="hidden md:inline-flex"
          >
            GitHub
          </UiButton>
          <UiButton variant="ai" size="sm" :icon="Play" to="/simulation">Lancer la démo</UiButton>
        </div>
      </div>
    </header>

    <main class="flex-1"><slot /></main>

    <footer
      class="border-t-4 bg-ink text-white"
      style="border-image: linear-gradient(90deg, #20d9e0, #2f86eb, #9b5cf2) 1"
    >
      <div class="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div class="space-y-4">
          <span class="flex items-center gap-2 font-display text-lg font-semibold">
            <BrandMark :size="28" /> Astro Assistant
          </span>
          <p class="max-w-xs text-sm text-white/70">
            Le médecin de bord intelligent, 100 % hors ligne, conçu pour les missions longue durée.
          </p>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <Rocket :size="13" aria-hidden="true" /> NASA Space Apps Challenge 2026
          </span>
        </div>
        <nav v-for="column in FOOTER_COLUMNS" :key="column.title" :aria-label="column.title">
          <p class="text-sm font-semibold">{{ column.title }}</p>
          <ul class="mt-4 space-y-2.5 text-sm text-white/70">
            <li v-for="link in column.links" :key="link.label">
              <NuxtLink :to="link.to" class="hover:text-white">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div class="border-t border-white/10">
        <div
          class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-white/60"
        >
          <p>© 2026 Astro Assistant · Prototype de hackathon, pas un dispositif médical certifié.</p>
          <div class="flex items-center gap-4">
            <NuxtLink to="/avertissement" class="hover:text-white">Avertissement</NuxtLink>
            <div class="flex rounded-md bg-white/10 p-0.5" role="radiogroup" aria-label="Langue">
              <button
                v-for="option in LANGUAGES"
                :key="option.value"
                type="button"
                role="radio"
                :aria-checked="language === option.value"
                class="h-6 rounded px-2 font-semibold"
                :class="language === option.value ? 'bg-white text-ink' : 'text-white/70'"
                @click="language = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
