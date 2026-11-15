/** Load mission data from the backend once, before the first page renders (SSR and client). */
export default defineNuxtPlugin(async () => {
  const state = useMissionState()
  // On the client after SSR, the state arrives in the payload: no second round trip.
  if (import.meta.client && state.value.crew !== null) return
  await loadMissionData()
})
