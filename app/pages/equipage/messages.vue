<script setup lang="ts">
import { Check, CircleCheck, FileText, RadioTower, Search } from 'lucide-vue-next'

/**
 * Page E-16 : messages du flight surgeon (F10.4, Figma « E-16 »).
 * L'accusé de réception est enregistré à bord et part avec le prochain paquet vers le sol.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Messages du sol') })

const { mission } = useMissionData()
const { messages: inbox } = await useGroundMessagesScreen()
const { markMessageRead } = useActions()

// Messages lus pendant la session (le serveur les enregistre aussi quand il répond).
const readIds = ref<Set<number>>(new Set())
const isUnread = (message: { id: number; unread: boolean }) =>
  message.unread && !readIds.value.has(message.id)

const filter = ref('all')
const FILTERS = computed(() => [
  { value: 'all', label: t('Tous') },
  { value: 'unread', label: t('Non lus · {n}', { n: inbox.value.filter(isUnread).length }) },
  { value: 'instructions', label: t('Consignes') },
])
const query = ref('')

const messages = computed(() =>
  inbox.value.filter((message) => {
    if (filter.value === 'unread' && !isUnread(message)) return false
    if (filter.value === 'instructions' && !message.isInstruction) return false
    const text = `${message.author} ${message.subject}`.toLowerCase()
    return text.includes(query.value.trim().toLowerCase())
  }),
)
const selectedId = ref(inbox.value[0]?.id ?? 0)
const selected = computed(
  () => inbox.value.find((message) => message.id === selectedId.value) ?? inbox.value[0]!,
)

const acknowledging = ref(false)
const ackError = ref<string | null>(null)
async function acknowledge() {
  acknowledging.value = true
  ackError.value = null
  try {
    await markMessageRead(selected.value.id)
    readIds.value = new Set([...readIds.value, selected.value.id])
  } catch (e) {
    ackError.value = t((e as Error).message)
  } finally {
    acknowledging.value = false
  }
}

/** Découpe un paragraphe sur les marqueurs **gras**. */
function segments(paragraph: string) {
  return paragraph.split('**').map((text, index) => ({ text, bold: index % 2 === 1 }))
}
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Messages du sol')"
      :subtitle="
        t('Consignes du flight surgeon reçues à chaque fenêtre de contact · latence {n} min', {
          n: mission.latencyMin,
        })
      "
    />

    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section
        class="rounded-2xl border border-divider bg-surface p-4 shadow-card"
        :aria-label="t('Boîte de réception')"
      >
        <label class="relative block">
          <span class="sr-only">{{ t('Rechercher un message') }}</span>
          <Search
            :size="16"
            class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <input
            v-model="query"
            type="search"
            :placeholder="t('Rechercher…')"
            class="h-10 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </label>
        <UiSegmented
          v-model="filter"
          class="mt-3"
          :options="FILTERS"
          size="sm"
          :label="t('Filtrer les messages')"
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
                  :class="isUnread(message) ? 'font-semibold' : 'text-ink-muted'"
                >
                  {{ t(message.subject) }}
                </span>
              </span>
              <span
                v-if="isUnread(message)"
                class="mt-2 size-2 shrink-0 rounded-full bg-primary"
                :aria-label="t('Non lu')"
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
              {{ t(selected.role) }} ·
              {{ t('reçu {at} (envoyé {sent})', { at: selected.receivedAt, sent: selected.sentAt }) }}
            </p>
          </div>
          <UiStatusBadge v-if="selected.isInstruction" level="info" :label="t('Consigne')" />
        </header>

        <h2 id="message-subject" class="mt-6 text-2xl font-semibold">{{ t(selected.subject) }}</h2>
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
            <span class="block text-xs text-ink-muted">{{ t('Paquet source · SHA-256 vérifié') }}</span>
          </span>
          <CircleCheck :size="18" class="text-nominal-ink" :aria-label="t('Intégrité vérifiée')" />
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <UiButton v-if="isUnread(selected)" :icon="Check" :disabled="acknowledging" @click="acknowledge">
            {{ t('Accuser réception') }}
          </UiButton>
          <span v-else class="flex items-center gap-2 text-sm font-medium text-nominal-ink" role="status">
            <CircleCheck :size="18" aria-hidden="true" /> {{ t('Réception confirmée') }}
          </span>
          <p v-if="ackError" class="text-sm text-critical-ink" role="alert">{{ ackError }}</p>
        </div>
        <p class="mt-5 flex items-center gap-2 rounded-xl bg-info-soft px-4 py-3 text-sm text-info-ink">
          <RadioTower :size="16" aria-hidden="true" />
          {{
            t('L’accusé de réception partira avec le prochain paquet vers le sol (fenêtre dans {time}).', {
              time: mission.nextContact,
            })
          }}
        </p>
      </article>
    </div>
  </div>
</template>
