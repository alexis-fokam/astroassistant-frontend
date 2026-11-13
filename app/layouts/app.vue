<script setup lang="ts">
// Signed-in application shell: header with module navigation, page body, floating assistant.
// `?urgence=recue` shows the alert other crew members receive during an emergency (U-03).
const route = useRoute()
const router = useRouter()
const showEmergencyReceived = computed(() => route.query.urgence === 'recue')

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
  </div>
</template>
