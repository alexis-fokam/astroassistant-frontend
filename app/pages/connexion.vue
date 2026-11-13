<script setup lang="ts">
import { Check, Delete, Lock, WifiOff } from 'lucide-vue-next'

/**
 * Pages A-01 / A-02: local profile picker and PIN unlock (spec §7, F9.4).
 * Demo mode: PINs are verified by the backend once the auth endpoint exists;
 * until then any 4-digit code unlocks the selected profile.
 */
definePageMeta({ layout: 'bare' })
useHead({ title: 'Connexion' })

const PIN_LENGTH = 4
const MAX_ATTEMPTS = 3

const { crew, mission } = useMissionData()
const selectedCode = ref(crew[1]!.code)
const pin = ref('')
const attemptsLeft = ref(MAX_ATTEMPTS)

const selected = computed(() => crew.find((member) => member.code === selectedCode.value)!)

function selectMember(code: string) {
  selectedCode.value = code
  pin.value = ''
}

function press(digit: string) {
  if (pin.value.length < PIN_LENGTH) pin.value += digit
}

function erase() {
  pin.value = pin.value.slice(0, -1)
}

function submit() {
  if (pin.value.length !== PIN_LENGTH) return
  navigateTo(selected.value.isCmo ? '/cmo' : '/equipage')
}

function onKeydown(event: KeyboardEvent) {
  if (/^\d$/.test(event.key)) press(event.key)
  else if (event.key === 'Backspace') erase()
  else if (event.key === 'Enter') submit()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-[minmax(0,560px)_1fr]">
    <!-- Profile picker -->
    <section class="flex flex-col border-r border-divider bg-surface px-8 py-10 sm:px-14">
      <BrandLogo :size="36" />
      <h1 class="mt-14 text-3xl font-bold">Qui utilise le poste ?</h1>
      <p class="mt-2 text-ink-muted">
        Profils locaux, données chiffrées sur l’appareil. Aucune connexion requise.
      </p>

      <ul class="mt-8 space-y-3" role="radiogroup" aria-label="Profil">
        <li v-for="member in crew" :key="member.code">
          <button
            type="button"
            role="radio"
            :aria-checked="member.code === selectedCode"
            class="flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors"
            :class="
              member.code === selectedCode
                ? 'border-primary bg-primary-soft'
                : 'border-divider bg-surface hover:bg-subtle'
            "
            @click="selectMember(member.code)"
          >
            <UiAvatar :initials="member.initials" :size="42" />
            <span class="flex-1">
              <span class="block font-semibold">{{ member.firstName }} {{ member.lastName }}</span>
              <span class="block text-sm text-ink-muted">{{ member.code }} · {{ member.role }}</span>
            </span>
            <span
              v-if="member.isCmo"
              class="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent"
            >
              CMO
            </span>
            <Check v-if="member.code === selectedCode" :size="20" class="text-primary" aria-hidden="true" />
          </button>
        </li>
      </ul>

      <div class="mt-auto flex flex-wrap items-center gap-3 pt-10 text-sm text-ink-muted">
        <span class="flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5">
          <WifiOff :size="14" aria-hidden="true" /> Hors ligne · {{ mission.clock }}
        </span>
        <span>Prototype — n’est pas un dispositif médical certifié.</span>
      </div>
    </section>

    <!-- PIN unlock -->
    <section
      class="flex items-center justify-center bg-canvas p-6"
      style="background-image: radial-gradient(circle at 50% 35%, rgb(70 182 246 / 0.12), transparent 55%)"
    >
      <div class="w-full max-w-sm rounded-2xl border border-divider bg-surface p-8 shadow-raised">
        <div class="flex flex-col items-center text-center">
          <UiAvatar :initials="selected.initials" :size="72" />
          <h2 class="mt-4 text-xl font-semibold">{{ selected.firstName }} {{ selected.lastName }}</h2>
          <p class="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
            <Lock :size="14" aria-hidden="true" />
            {{ selected.isCmo ? 'Profil CMO · accès à tout l’équipage' : 'Accès à vos propres données' }}
          </p>
        </div>

        <div class="mt-7 flex justify-center gap-4" aria-live="polite">
          <span
            v-for="i in PIN_LENGTH"
            :key="i"
            class="size-4 rounded-full border-2 transition-colors"
            :class="i <= pin.length ? 'border-primary bg-primary' : 'border-line'"
          />
          <span class="sr-only">{{ pin.length }} chiffres saisis sur {{ PIN_LENGTH }}</span>
        </div>

        <div class="mt-7 grid grid-cols-3 gap-3">
          <button
            v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
            :key="digit"
            type="button"
            class="h-16 rounded-xl border border-divider bg-subtle font-display text-2xl font-semibold hover:bg-divider"
            @click="press(digit)"
          >
            {{ digit }}
          </button>
          <button
            type="button"
            class="flex h-16 items-center justify-center rounded-xl text-ink-muted hover:bg-subtle"
            aria-label="Effacer"
            @click="erase"
          >
            <Delete :size="24" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="h-16 rounded-xl border border-divider bg-subtle font-display text-2xl font-semibold hover:bg-divider"
            @click="press('0')"
          >
            0
          </button>
          <button
            type="button"
            class="flex h-16 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40"
            :disabled="pin.length !== PIN_LENGTH"
            aria-label="Déverrouiller"
            @click="submit"
          >
            <Check :size="26" :stroke-width="2.5" aria-hidden="true" />
          </button>
        </div>

        <p class="mt-5 text-center text-xs text-ink-muted">
          {{ attemptsLeft }} tentatives restantes, puis verrouillage 5 min.
        </p>
      </div>
    </section>
  </div>
</template>
