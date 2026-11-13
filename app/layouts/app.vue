<script setup lang="ts">
// Signed-in application shell: header with module navigation, page body, floating assistant.
// Query overlays: `?urgence=recue` shows the alert other crew members receive (U-03),
// `?visite=N` shows step N of the jury guided tour (D-04).
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
    <main class="mx-auto max-w-[1440px] px-6 py-6">
      <slot />
    </main>
    <ShellAskAstro />
    <ShellEmergencyReceived v-if="showEmergencyReceived" @close="dismissEmergency" />
    <ShellGuidedTour v-if="tourStep > 0" :step="tourStep" />
  </div>
</template>
