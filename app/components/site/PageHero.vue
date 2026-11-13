<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

// Hero of the public inner pages (Figma P-02, P-03): breadcrumb, eyebrow, title, intro.
defineProps<{ crumb: string; eyebrow: string; title: string; intro?: string }>()
</script>

<template>
  <section
    style="
      background-image:
        radial-gradient(circle at 0% 0%, rgb(32 217 224 / 0.12), transparent 45%),
        radial-gradient(circle at 100% 0%, rgb(155 92 242 / 0.1), transparent 45%);
    "
  >
    <div class="mx-auto max-w-6xl px-6 pt-10 pb-12">
      <nav aria-label="Fil d’Ariane" class="flex items-center gap-1.5 text-xs text-ink-muted">
        <NuxtLink to="/" class="hover:text-ink">Accueil</NuxtLink>
        <ChevronRight :size="12" aria-hidden="true" />
        <span aria-current="page">{{ crumb }}</span>
      </nav>
      <p class="mt-5 text-[11px] font-semibold tracking-wider text-accent uppercase">{{ eyebrow }}</p>
      <h1 class="mt-2 max-w-4xl text-[40px] leading-tight font-semibold">{{ title }}</h1>
      <p v-if="intro" class="mt-3 max-w-2xl text-ink-muted">{{ intro }}</p>
      <slot />
    </div>
  </section>
</template>
