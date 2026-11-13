<script setup lang="ts">
import { SITE_LINKS } from '~/constants/navigation'

// Public website shell (landing and informational pages).
</script>

<template>
  <div class="min-h-dvh bg-surface">
    <header class="sticky top-0 z-30 border-b border-divider bg-surface/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <BrandLogo />
        <nav aria-label="Site" class="ml-4 hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="link in SITE_LINKS"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-subtle hover:text-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="ml-auto flex items-center gap-2">
          <UiButton variant="ghost" size="sm" to="/connexion">Se connecter</UiButton>
          <UiButton size="sm" to="/simulation">Lancer la démo</UiButton>
        </div>
      </div>
    </header>

    <slot />

    <footer class="border-t border-divider bg-canvas">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between"
      >
        <div class="space-y-2">
          <BrandLogo :size="28" />
          <p class="max-w-md text-sm text-ink-muted">
            Prototype réalisé pour le NASA Space Apps Challenge 2026. Ce n’est pas un dispositif médical
            certifié.
          </p>
        </div>
        <nav aria-label="Pied de page" class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          <NuxtLink v-for="link in SITE_LINKS" :key="link.to" :to="link.to" class="hover:text-ink">
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>
