<script setup lang="ts">
import { Check, CircleCheck, Download, FileText, Info, ShieldCheck } from 'lucide-vue-next'

/**
 * Page S-03: import of ground instructions (spec F10.4-F10.5, Figma "S-03 · Import des consignes du sol").
 * Packets are signed and verified (SHA-256) before any instruction is shown to the crew.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Importer des consignes du sol' })

const { findCrew } = useMissionData()

const CHECKS = [
  { title: 'Fichier reçu', detail: 'consignes_J142_1702.json.gz · 6 Ko' },
  { title: 'Empreinte SHA-256 vérifiée', detail: '4c7e…a1d9 · conforme' },
  { title: 'Décompression', detail: '2 consignes, 1 pièce jointe' },
  { title: 'Destinataires reconnus', detail: 'AV-02 Léo Martin · AV-04 Kenji Arai' },
]

type InstructionState = 'pending' | 'imported' | 'ignored'

const instructions = ref([
  {
    id: 1,
    crew: 'AV-02',
    text: 'Prolonger la fenêtre de sommeil de 45 min pendant 3 nuits. Refaire un PVT avant l’EVA de J+143.',
    state: 'pending' as InstructionState,
  },
  {
    id: 2,
    crew: 'AV-04',
    text: 'OCT au prochain créneau, transmettre les images au prochain contact.',
    state: 'pending' as InstructionState,
  },
])

const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)

function importAll() {
  instructions.value.forEach((instruction) => {
    if (instruction.state === 'pending') instruction.state = 'imported'
  })
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Importer des consignes du sol"
      subtitle="Les messages du flight surgeon arrivent dans un paquet signé, vérifié avant affichage (F10.4, F10.5)"
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="space-y-6">
        <section
          class="flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors"
          :class="dragging ? 'border-primary bg-primary-soft' : 'border-brand-sky bg-primary-soft/60'"
          aria-label="Dépôt d’un paquet"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="dragging = false"
        >
          <Download :size="30" class="text-primary" aria-hidden="true" />
          <p class="mt-3 font-semibold">Déposez un paquet reçu du sol</p>
          <p class="mt-1 text-sm text-ink-muted">
            ou réception automatique à l’ouverture de la fenêtre de contact
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".gz,.json"
            class="sr-only"
            aria-label="Choisir un paquet"
          />
          <UiButton class="mt-4" variant="secondary" :icon="FileText" @click="fileInput?.click()">
            Choisir un fichier
          </UiButton>
        </section>

        <UiCard title="Vérifications" :icon="ShieldCheck">
          <template #actions>
            <span
              class="flex items-center gap-1.5 rounded-full bg-nominal-soft px-2.5 py-1 text-xs font-semibold text-nominal-ink"
            >
              <CircleCheck :size="13" aria-hidden="true" /> Paquet valide
            </span>
          </template>
          <ol class="space-y-2.5">
            <li
              v-for="check in CHECKS"
              :key="check.title"
              class="flex items-center gap-3 rounded-xl bg-subtle p-3.5"
            >
              <CircleCheck :size="20" class="shrink-0 text-nominal-ink" aria-label="Validé" />
              <span class="text-sm">
                <span class="block font-semibold">{{ check.title }}</span>
                <span class="block text-xs text-ink-muted">{{ check.detail }}</span>
              </span>
            </li>
          </ol>
        </UiCard>
      </div>

      <section aria-labelledby="instructions-title" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 id="instructions-title" class="text-xl font-semibold">
            {{ instructions.length }} consignes trouvées
          </h2>
          <UiButton :icon="Check" @click="importAll">Tout importer</UiButton>
        </div>
        <article
          v-for="instruction in instructions"
          :key="instruction.id"
          class="rounded-2xl border border-l-4 border-brand-sky bg-surface p-5 shadow-card"
          :class="instruction.state === 'ignored' && 'opacity-50'"
        >
          <div class="flex items-center gap-3">
            <UiAvatar
              :initials="findCrew(instruction.crew)!.initials"
              :tone="findCrew(instruction.crew)!.tone"
              :size="30"
            />
            <span class="flex-1 text-sm font-semibold">
              Pour {{ findCrew(instruction.crew)!.firstName }} {{ findCrew(instruction.crew)!.lastName }}
            </span>
            <UiStatusBadge level="info" label="Consigne" />
          </div>
          <p class="mt-3">{{ instruction.text }}</p>
          <div class="mt-4 flex items-center gap-2">
            <template v-if="instruction.state === 'pending'">
              <UiButton size="sm" :icon="Check" @click="instruction.state = 'imported'">Importer</UiButton>
              <UiButton size="sm" variant="ghost" @click="instruction.state = 'ignored'">Ignorer</UiButton>
            </template>
            <span
              v-else-if="instruction.state === 'imported'"
              class="flex items-center gap-1.5 text-sm font-semibold text-nominal-ink"
            >
              <CircleCheck :size="16" aria-hidden="true" /> Importée
            </span>
            <span v-else class="text-sm text-ink-muted">Ignorée</span>
          </div>
        </article>
        <p class="flex items-start gap-2.5 rounded-xl bg-info-soft p-4 text-sm">
          <Info :size="17" class="mt-0.5 shrink-0 text-info-ink" aria-hidden="true" />
          Les consignes importées apparaissent dans « Messages du sol » de chaque astronaute et dans le
          journal d’audit.
        </p>
      </section>
    </div>
  </div>
</template>
