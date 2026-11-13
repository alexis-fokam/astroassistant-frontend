<script setup lang="ts">
import { ChevronLeft, ChevronRight, CircleCheck, Play, Timer, X } from 'lucide-vue-next'
import { TOUR_STEPS } from '~/constants/guidedTour'

/**
 * D-04: jury guided tour. The current step comes from `?visite=N` (1-based); each step
 * navigates to the page it explains, with this card and the checklist on top.
 */
const props = defineProps<{ step: number }>()

const index = computed(() => Math.min(Math.max(props.step, 1), TOUR_STEPS.length) - 1)
const current = computed(() => TOUR_STEPS[index.value]!)

function goTo(position: number) {
  const target = TOUR_STEPS[position - 1]
  if (target) navigateTo({ path: target.route, query: { visite: position } })
}

function close() {
  navigateTo({ path: useRoute().path })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 bg-ink/35" aria-hidden="true" @click="close" />

    <aside
      class="fixed top-36 right-8 z-50 hidden w-72 rounded-2xl bg-surface p-5 shadow-raised lg:block"
      aria-label="Parcours jury"
    >
      <p class="font-semibold">Parcours jury</p>
      <ol class="mt-3 space-y-2.5 text-sm">
        <li v-for="(item, i) in TOUR_STEPS" :key="item.short">
          <button
            type="button"
            class="flex w-full items-center gap-2 text-left"
            :class="i === index ? 'font-semibold' : 'text-ink-muted hover:text-ink'"
            :aria-current="i === index ? 'step' : undefined"
            @click="goTo(i + 1)"
          >
            <CircleCheck v-if="i < index" :size="16" class="text-nominal-ink" aria-label="Vu" />
            <Play v-else-if="i === index" :size="16" class="text-primary" aria-hidden="true" />
            <Timer v-else :size="16" aria-hidden="true" />
            {{ item.short }}
          </button>
        </li>
      </ol>
    </aside>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      class="fixed top-1/2 left-1/2 z-50 w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-raised"
    >
      <div class="flex items-start justify-between gap-4">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">
          Visite guidée · {{ index + 1 }} / {{ TOUR_STEPS.length }}
        </p>
        <button
          type="button"
          class="rounded-md p-1 text-ink-muted hover:bg-subtle"
          aria-label="Fermer la visite"
          @click="close"
        >
          <X :size="18" aria-hidden="true" />
        </button>
      </div>
      <h2 id="tour-title" class="mt-2 text-lg font-semibold">{{ current.title }}</h2>
      <p class="mt-1.5 text-sm text-ink-muted">{{ current.text }}</p>
      <div class="mt-5 flex items-center justify-between">
        <span class="flex gap-1.5" aria-hidden="true">
          <span
            v-for="(_, i) in TOUR_STEPS"
            :key="i"
            class="h-1.5 rounded-full"
            :class="i === index ? 'w-5 bg-primary' : 'w-1.5 bg-line'"
          />
        </span>
        <span class="flex gap-2">
          <UiButton v-if="index > 0" variant="ghost" size="sm" :icon="ChevronLeft" @click="goTo(index)">
            Précédent
          </UiButton>
          <UiButton
            v-if="index < TOUR_STEPS.length - 1"
            size="sm"
            :icon="ChevronRight"
            @click="goTo(index + 2)"
          >
            Suivant
          </UiButton>
          <UiButton v-else size="sm" :icon="CircleCheck" @click="close">Terminer</UiButton>
        </span>
      </div>
    </div>
  </Teleport>
</template>
