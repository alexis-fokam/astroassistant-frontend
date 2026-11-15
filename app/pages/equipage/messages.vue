<script setup lang="ts">
import {
  CalendarPlus,
  Check,
  CircleCheck,
  FileText,
  MoreHorizontal,
  RadioTower,
  Search,
  Send,
} from 'lucide-vue-next'

/**
 * Page E-16: messages from the flight surgeon (spec F10.4, Figma "E-16 · Messages du flight surgeon").
 * Replies are queued for export and leave at the next contact window (store-and-forward).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Messages du sol' })

const { mission } = useMissionData()
const { messages: inbox } = await useGroundMessagesScreen()

const filter = ref('all')
const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'unread', label: `Non lus · ${inbox.value.filter((m) => m.unread).length}` },
  { value: 'instructions', label: 'Consignes' },
]
const query = ref('')

const messages = computed(() =>
  inbox.value.filter((message) => {
    if (filter.value === 'unread' && !message.unread) return false
    if (filter.value === 'instructions' && !message.isInstruction) return false
    const text = `${message.author} ${message.subject}`.toLowerCase()
    return text.includes(query.value.trim().toLowerCase())
  }),
)
const selectedId = ref(inbox.value[0]?.id ?? 0)
const selected = computed(
  () => inbox.value.find((message) => message.id === selectedId.value) ?? inbox.value[0]!,
)

/** Splits a paragraph on **bold** markers. */
function segments(paragraph: string) {
  return paragraph.split('**').map((text, index) => ({ text, bold: index % 2 === 1 }))
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Messages du sol"
      :subtitle="`Consignes du flight surgeon reçues à chaque fenêtre de contact · latence ${mission.latencyMin} min`"
    >
      <template #actions><UiButton :icon="Send">Rédiger un message</UiButton></template>
    </UiPageHeader>

    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section
        class="rounded-2xl border border-divider bg-surface p-4 shadow-card"
        aria-label="Boîte de réception"
      >
        <label class="relative block">
          <span class="sr-only">Rechercher un message</span>
          <Search
            :size="16"
            class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <input
            v-model="query"
            type="search"
            placeholder="Rechercher…"
            class="h-10 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </label>
        <UiSegmented
          v-model="filter"
          class="mt-3"
          :options="FILTERS"
          size="sm"
          label="Filtrer les messages"
        />
        <ul class="mt-3 space-y-1">
          <li v-for="message in messages" :key="message.id">
            <button
              type="button"
              class="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors"
              :class="message.id === selectedId ? 'bg-primary-soft' : 'hover:bg-subtle'"
              :aria-current="message.id === selectedId ? 'true' : undefined"
              @click="selectedId = message.id"
            >
              <UiAvatar :initials="message.initials" :tone="message.tone" :size="36" />
              <span class="min-w-0 flex-1">
                <span class="flex justify-between gap-2 text-sm">
                  <span class="font-semibold">{{ message.author }}</span>
                  <span class="text-xs whitespace-nowrap text-ink-muted">{{ message.receivedAt }}</span>
                </span>
                <span
                  class="block truncate text-sm"
                  :class="message.unread ? 'font-semibold' : 'text-ink-muted'"
                >
                  {{ message.subject }}
                </span>
              </span>
              <span
                v-if="message.unread"
                class="mt-2 size-2 shrink-0 rounded-full bg-primary"
                aria-label="Non lu"
              />
            </button>
          </li>
        </ul>
      </section>

      <article
        class="rounded-2xl border border-divider bg-surface p-6 shadow-card"
        aria-labelledby="message-subject"
      >
        <header class="flex items-start gap-3">
          <UiAvatar :initials="selected.initials" :tone="selected.tone" :size="44" />
          <div class="flex-1">
            <p class="font-semibold">{{ selected.author }}</p>
            <p class="text-xs text-ink-muted">
              {{ selected.role }} · reçu {{ selected.receivedAt }} (envoyé {{ selected.sentAt }})
            </p>
          </div>
          <UiStatusBadge v-if="selected.isInstruction" level="info" label="Consigne" />
          <button
            type="button"
            class="rounded-md p-1.5 text-ink-muted hover:bg-subtle"
            aria-label="Plus d’actions"
          >
            <MoreHorizontal :size="18" aria-hidden="true" />
          </button>
        </header>

        <h2 id="message-subject" class="mt-6 text-2xl font-semibold">{{ selected.subject }}</h2>
        <div class="mt-4 space-y-4 text-[15px]">
          <p v-for="(paragraph, index) in selected.body" :key="index">
            <template v-for="(segment, i) in segments(paragraph)" :key="i">
              <b v-if="segment.bold">{{ segment.text }}</b>
              <template v-else>{{ segment.text }}</template>
            </template>
          </p>
        </div>

        <div
          v-if="selected.attachment"
          class="mt-6 flex items-center gap-3 rounded-xl border border-divider p-4"
        >
          <FileText :size="20" class="text-primary" aria-hidden="true" />
          <span class="flex-1 text-sm">
            <span class="block font-semibold">{{ selected.attachment }}</span>
            <span class="block text-xs text-ink-muted">Paquet source · SHA-256 vérifié</span>
          </span>
          <CircleCheck :size="18" class="text-nominal-ink" aria-label="Intégrité vérifiée" />
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <UiButton :icon="Check">Accuser réception</UiButton>
          <UiButton variant="secondary" :icon="CalendarPlus">Ajouter au planning</UiButton>
          <UiButton variant="secondary" :icon="Send">Répondre</UiButton>
        </div>
        <p class="mt-4 flex items-center gap-2 rounded-xl bg-info-soft px-4 py-3 text-sm text-info-ink">
          <RadioTower :size="16" aria-hidden="true" />
          Votre réponse sera placée dans la file d’export et partira à la prochaine fenêtre (dans
          {{ mission.nextContact }}).
        </p>
      </article>
    </div>
  </div>
</template>
