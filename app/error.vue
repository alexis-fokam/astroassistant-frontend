<script setup lang="ts">
/**
 * Page d'erreur de l'application (404 et erreurs inattendues), en français ou en anglais.
 * Elle ne montre jamais de détail technique à l'équipage : le détail part dans la console.
 */
import { House, RefreshCw, TriangleAlert } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: () => t(notFound.value ? 'Page introuvable' : 'Une erreur est survenue') })

if (import.meta.client && !notFound.value) console.error(props.error)

const home = () => clearError({ redirect: '/' })
const retry = () => clearError({ redirect: useRoute().fullPath })
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-canvas p-6">
    <div class="w-full max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-raised">
      <div class="flex justify-end"><UiLanguageSwitch /></div>
      <div
        class="mx-auto mt-2 flex size-14 items-center justify-center rounded-2xl bg-warning-soft text-warning-ink"
      >
        <TriangleAlert :size="28" aria-hidden="true" />
      </div>
      <p class="mt-4 font-mono text-sm text-ink-muted">{{ error.statusCode }}</p>
      <h1 class="mt-1 text-2xl font-semibold">
        {{ t(notFound ? 'Page introuvable' : 'Une erreur est survenue') }}
      </h1>
      <p class="mt-2 text-sm text-ink-muted">
        {{
          t(
            notFound
              ? 'Cette page n’existe pas ou a été déplacée.'
              : 'L’application a rencontré un problème. Vos données à bord sont intactes.',
          )
        }}
      </p>
      <div class="mt-6 flex justify-center gap-2">
        <UiButton :icon="House" @click="home">{{ t('Revenir à l’accueil') }}</UiButton>
        <UiButton v-if="!notFound" variant="secondary" :icon="RefreshCw" @click="retry">
          {{ t('Réessayer') }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
