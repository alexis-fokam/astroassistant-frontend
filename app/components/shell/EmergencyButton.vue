<script setup lang="ts">
/**
 * Emergency trigger available on every screen (spec F12.1).
 * Two-gesture confirmation to prevent accidental activation: tap opens a dialog,
 * then the user must hold the confirm button for HOLD_MS (pointer or keyboard).
 */
import { Siren, X } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const HOLD_MS = 2000

const open = ref(false)
const progress = ref(0)
let startedAt = 0
let frame = 0

function tick(now: number) {
  progress.value = Math.min(1, (now - startedAt) / HOLD_MS)
  if (progress.value >= 1) {
    cancelHold()
    open.value = false
    navigateTo('/urgence')
    return
  }
  frame = requestAnimationFrame(tick)
}

function startHold() {
  if (progress.value > 0) return
  startedAt = performance.now()
  frame = requestAnimationFrame(tick)
}

function cancelHold() {
  cancelAnimationFrame(frame)
  progress.value = 0
}

onBeforeUnmount(cancelHold)
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    class="flex h-10 items-center gap-2 rounded-lg bg-critical px-3.5 text-sm font-semibold text-white hover:bg-critical-ink"
    @click="open = true"
  >
    <Siren :size="17" :stroke-width="2" aria-hidden="true" />
    Urgence
  </button>

  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      @click.self="open = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-title"
        class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-raised"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex size-12 items-center justify-center rounded-xl bg-critical-soft text-critical-ink">
            <Siren :size="26" :stroke-width="2" aria-hidden="true" />
          </div>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-md text-ink-muted hover:bg-subtle"
            aria-label="Annuler"
            @click="open = false"
          >
            <X :size="20" aria-hidden="true" />
          </button>
        </div>
        <h2 id="emergency-title" class="mt-4 text-xl font-semibold">Déclencher le mode urgence ?</h2>
        <p class="mt-1.5 text-sm text-ink-muted">
          Tout l’équipage sera alerté et un paquet CRITICAL passera en tête de la file vers le sol.
        </p>
        <button
          type="button"
          class="relative mt-6 flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-critical-ink font-bold text-white select-none"
          @pointerdown="startHold"
          @pointerup="cancelHold"
          @pointerleave="cancelHold"
          @keydown.enter.prevent="startHold"
          @keydown.space.prevent="startHold"
          @keyup.enter="cancelHold"
          @keyup.space="cancelHold"
        >
          <span class="absolute inset-y-0 left-0 bg-critical" :style="{ width: `${progress * 100}%` }" />
          <span class="relative flex items-center gap-2">
            <Siren :size="18" aria-hidden="true" />
            Maintenir 2 secondes pour confirmer
          </span>
        </button>
        <p class="mt-3 text-center text-xs text-ink-muted">
          Relâcher annule. Aucune action en un seul geste.
        </p>
      </div>
    </div>
  </Teleport>
</template>
