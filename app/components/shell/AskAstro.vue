<script setup lang="ts">
/**
 * Floating "Ask Astro" assistant — planned evolution (spec §16.2: offline
 * conversational assistant). For now it shows a canned answer and makes no network call.
 */
import { Send, Sparkles, X } from 'lucide-vue-next'

const open = ref(false)
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
    <button
      v-if="!open"
      type="button"
      class="pointer-events-auto flex h-12 items-center gap-2.5 rounded-full border border-divider bg-surface px-5 text-sm text-ink-muted shadow-raised hover:text-ink"
      @click="open = true"
    >
      <Sparkles :size="18" class="text-accent" aria-hidden="true" />
      Demander à Astro…
    </button>

    <div
      v-else
      role="dialog"
      aria-label="Assistant Astro"
      class="pointer-events-auto w-full max-w-xl rounded-2xl border border-divider bg-surface p-4 shadow-raised"
    >
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-sm font-semibold">
          <span class="flex size-7 items-center justify-center rounded-lg bg-brand-gradient">
            <Sparkles :size="15" class="text-white" aria-hidden="true" />
          </span>
          Astro · assistant embarqué
          <span class="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent"
            >Hors ligne</span
          >
        </span>
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-subtle"
          aria-label="Fermer"
          @click="open = false"
        >
          <X :size="18" aria-hidden="true" />
        </button>
      </div>
      <div class="mt-3 space-y-3 text-sm">
        <p class="ml-auto w-fit rounded-xl rounded-br-sm bg-primary-soft px-3 py-2">
          Pourquoi suis-je en WARNING ?
        </p>
        <p class="w-fit max-w-[90%] rounded-xl rounded-bl-sm bg-subtle px-3 py-2">
          Votre VFC est à 65 % de votre baseline depuis 3 jours (31 ms contre 48 ms) et vous avez cumulé 5,5 h
          de dette de sommeil. Le protocole <b>PRT-STRESS-01</b> (9 min) est recommandé.
        </p>
      </div>
      <form class="mt-3 flex items-center gap-2" @submit.prevent>
        <label for="ask-astro-input" class="sr-only">Votre question</label>
        <input
          id="ask-astro-input"
          type="text"
          placeholder="Posez une question sur vos données…"
          class="h-11 flex-1 rounded-lg border border-line px-3 text-sm outline-none focus:border-primary"
        />
        <UiButton type="submit" :icon="Send" aria-label="Envoyer" />
      </form>
    </div>
  </div>
</template>
