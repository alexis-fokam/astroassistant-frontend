<script setup lang="ts">
// Coquille de l'application connectée : en-tête et navigation du module, page, panneau
// « Expliquer mon statut ». Paramètres d'URL : `?urgence=recue` affiche l'alerte reçue par
// le reste de l'équipage (U-03), `?visite=N` l'étape N de la visite guidée du jury (D-04).
const route = useRoute()
const router = useRouter()

const showEmergencyReceived = computed(() => route.query.urgence === 'recue')
const tourStep = computed(() => Number(route.query.visite) || 0)

function dismissEmergency() {
  router.replace({ query: { ...route.query, urgence: undefined } })
}
</script>

<template>
  <div class="min-h-dvh pb-24">
    <ShellHeader />
    <main class="page-rise mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <slot />
    </main>
    <ShellAskAstro />
    <ShellEmergencyReceived v-if="showEmergencyReceived" @close="dismissEmergency" />
    <ShellGuidedTour v-if="tourStep > 0" :step="tourStep" />
  </div>
</template>
