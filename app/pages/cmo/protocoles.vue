<script setup lang="ts">
import {
  Box,
  CircleCheck,
  Code,
  Download,
  ListChecks,
  Play,
  RefreshCw,
  Search,
  Sun,
  TriangleAlert,
  Zap,
} from 'lucide-vue-next'
import { LEVEL_STYLES } from '~/constants/levels'

/**
 * Page M-05 : bibliothèque de protocoles versionnés et fiche protocole (F4.1, F11.2,
 * Figma « M-05 »). La fiche s'exporte en JSON ; « Lancer » ouvre l'exécution pas à pas.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Bibliothèque de protocoles') })

/** Fiche du protocole sélectionné, téléchargée en JSON (versionnée, partageable avec le sol). */
function exportSheet() {
  const p = selected.value
  downloadFile(`${p.code}-v${p.version}.json`, JSON.stringify(p, null, 2), 'application/json')
}

const { library } = await useProtocolLibraryScreen()

const query = ref('')
const protocols = computed(() =>
  library.value.filter((protocol) =>
    `${protocol.title} ${protocol.code}`.toLowerCase().includes(query.value.trim().toLowerCase()),
  ),
)
const selectedCode = ref(library.value[0]?.code ?? '')
const selected = computed(
  () => library.value.find((protocol) => protocol.code === selectedCode.value) ?? library.value[0]!,
)
const selectedStyle = computed(() => LEVEL_STYLES[selected.value.level])

const MATERIAL_STATUS = {
  available: { level: 'nominal', label: 'Disponible' },
  low: { level: 'warning', label: 'Stock bas' },
  missing: { level: 'critical', label: 'Rupture' },
} as const
const materials = computed(() =>
  selected.value.materials.map((material) => ({ ...material, ...MATERIAL_STATUS[material.status] })),
)
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Bibliothèque de protocoles')"
      :subtitle="
        t('{n} protocoles versionnés (JSON) · un protocole par alerte WARNING ou CRITICAL', {
          n: library.length,
        })
      "
    >
      <template #actions
        ><UiButton variant="secondary" :icon="Download" @click="exportSheet">{{
          t('Exporter la fiche (JSON)')
        }}</UiButton></template
      >
    </UiPageHeader>

    <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section
        class="h-fit rounded-2xl border border-divider bg-surface p-4 shadow-card"
        aria-label="Protocoles"
      >
        <label class="relative block">
          <span class="sr-only">Rechercher un protocole</span>
          <Search
            :size="16"
            class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <input
            v-model="query"
            type="search"
            placeholder="Rechercher un protocole…"
            class="h-10 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </label>
        <ul class="mt-3 space-y-1">
          <li v-for="protocol in protocols" :key="protocol.code">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors"
              :class="protocol.code === selectedCode ? 'bg-primary-soft' : 'hover:bg-subtle'"
              :aria-current="protocol.code === selectedCode ? 'true' : undefined"
              @click="selectedCode = protocol.code"
            >
              <span class="flex-1 text-sm">
                <span class="block font-semibold">{{ protocol.title }}</span>
                <span class="block text-xs text-ink-muted"
                  >{{ protocol.code }} · v{{ protocol.version }}</span
                >
              </span>
              <UiStatusBadge :level="protocol.level" />
            </button>
          </li>
        </ul>
      </section>

      <div class="space-y-6">
        <section
          class="flex flex-wrap items-center gap-5 rounded-2xl border border-divider bg-surface p-6 shadow-card"
        >
          <span class="flex size-16 items-center justify-center rounded-2xl" :class="selectedStyle.soft">
            <Sun v-if="selected.code === 'PRT-RAD-02'" :size="28" aria-hidden="true" />
            <ListChecks v-else :size="28" aria-hidden="true" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-2xl font-semibold">{{ selected.title }}</h2>
              <UiStatusBadge :level="selected.level" size="md" />
            </div>
            <p class="mt-1 text-sm text-ink-muted">
              {{ selected.code }} · version {{ selected.version }} · mise à jour {{ selected.updated }} ·
              validée par
              {{ selected.validatedBy }}
            </p>
          </div>
          <UiButton
            :variant="selected.level === 'critical' ? 'danger' : 'primary'"
            :icon="Play"
            :to="`/equipage/protocoles/${selected.code}`"
          >
            {{ t('Lancer le protocole') }}
          </UiButton>
        </section>

        <div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <UiCard title="Étapes" :subtitle="`Durée estimée : ${selected.duration}`" :icon="ListChecks">
            <ol class="space-y-4">
              <li v-for="(step, index) in selected.steps" :key="step.title" class="flex gap-4">
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-line text-sm font-semibold text-ink-muted"
                >
                  {{ index + 1 }}
                </span>
                <span class="text-sm">
                  <span class="block font-semibold">{{ step.title }}</span>
                  <span class="block text-xs text-ink-muted">{{ step.timing }}</span>
                </span>
              </li>
            </ol>
          </UiCard>

          <div class="space-y-6">
            <UiCard title="Déclencheur" :icon="Zap">
              <p class="flex gap-2.5 rounded-xl bg-primary-soft p-3.5 text-sm">
                <Code :size="16" class="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <b class="block font-mono text-xs">{{ selected.trigger.rule }}</b>
                  <span class="text-ink-muted">{{ selected.trigger.condition }}</span>
                </span>
              </p>
            </UiCard>

            <UiCard title="Matériel nécessaire" :icon="Box">
              <ul v-if="materials.length" class="space-y-2.5">
                <li
                  v-for="material in materials"
                  :key="material.name"
                  class="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{{ material.name }}</span>
                  <UiStatusBadge :level="material.level" :label="material.label" />
                </li>
              </ul>
              <p v-else class="flex items-center gap-2 text-sm text-ink-muted">
                <CircleCheck :size="16" class="text-nominal-ink" aria-hidden="true" /> Aucun matériel requis
              </p>
              <p class="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                <TriangleAlert :size="13" aria-hidden="true" /> Vérifié dans la pharmacie avant exécution
                (F11.2).
              </p>
            </UiCard>

            <UiCard title="Historique des versions" :icon="RefreshCw">
              <dl class="space-y-2.5 text-sm">
                <div
                  v-for="version in selected.versions"
                  :key="version.version"
                  class="flex justify-between gap-3"
                >
                  <dt class="text-ink-muted">{{ version.version }}</dt>
                  <dd>{{ version.note }}</dd>
                </div>
              </dl>
            </UiCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
