<script setup lang="ts">
import { Activity, Check, HeartPulse, House, Package, Siren } from 'lucide-vue-next'

/**
 * U-03: alert shown to every other crew member when someone triggers the
 * emergency mode (spec F12.3, Figma "U-03 · Alerte d'urgence reçue").
 */
const emit = defineEmits<{ close: [] }>()
const { findCrew } = useMissionData()
const patient = findCrew('AV-03')!
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-critical/45 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="emergency-received-title"
        class="w-full max-w-xl rounded-2xl bg-surface p-8 text-center shadow-raised"
      >
        <span
          class="mx-auto flex size-20 animate-alert-pulse items-center justify-center rounded-full bg-critical text-white"
        >
          <Siren :size="34" aria-hidden="true" />
        </span>
        <p class="mt-5 text-[11px] font-semibold tracking-wider text-critical-ink uppercase">
          Urgence médicale · il y a 12 s
        </p>
        <h2 id="emergency-received-title" class="mt-1 text-3xl font-semibold">
          {{ patient.firstName }} {{ patient.lastName }} a besoin d’aide
        </h2>
        <p class="mt-1 text-ink-muted">Déclenché par Léo Martin, qui est sur place.</p>

        <dl class="mt-6 grid grid-cols-3 gap-3 text-left">
          <div class="rounded-xl bg-subtle p-3">
            <House :size="17" class="text-primary" aria-hidden="true" />
            <dt class="mt-2 text-xs text-ink-muted">Lieu</dt>
            <dd class="text-sm font-semibold">Module A · labo</dd>
          </div>
          <div class="rounded-xl bg-subtle p-3">
            <HeartPulse :size="17" class="text-critical-ink" aria-hidden="true" />
            <dt class="mt-2 text-xs text-ink-muted">Fréquence cardiaque</dt>
            <dd class="text-sm font-semibold text-critical-ink">128 bpm</dd>
          </div>
          <div class="rounded-xl bg-subtle p-3">
            <Package :size="17" class="text-primary" aria-hidden="true" />
            <dt class="mt-2 text-xs text-ink-muted">Kit à apporter</dt>
            <dd class="text-sm font-semibold">Kit médical B</dd>
          </div>
        </dl>

        <div class="mt-6 grid grid-cols-[1.4fr_1fr] gap-3">
          <UiButton variant="danger" size="lg" :icon="Check" to="/urgence">J’arrive</UiButton>
          <UiButton variant="secondary" size="lg" :icon="Activity" @click="emit('close')"
            >Voir les constantes</UiButton
          >
        </div>
        <p class="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <UiAvatar initials="LM" :tone="2" :size="22" />
          <UiAvatar initials="KA" :tone="4" :size="22" />
          2 membres sur 3 ont accusé réception
        </p>
      </div>
    </div>
  </Teleport>
</template>
