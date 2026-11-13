<script setup lang="ts">
import { Bell, CircleHelp, RadioTower, Search, WifiOff } from 'lucide-vue-next'
import { APP_MODULES } from '~/constants/navigation'
import { isNavItemActive, moduleForPath } from '~/utils/navigation'

// Horizontal app header: brand, module switcher, search, mission status, user and emergency.
const route = useRoute()
const { mission, currentCrew, findCrew } = useMissionData()

const currentModule = computed(() => moduleForPath(route.path))
const user = computed(() => (currentModule.value.key === 'cmo' ? findCrew('AV-04')! : currentCrew))
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-divider bg-surface/95 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6">
      <BrandLogo to="/equipage" />

      <nav aria-label="Modules" class="ml-2 flex items-center gap-1 rounded-lg bg-subtle p-1">
        <NuxtLink
          v-for="m in APP_MODULES"
          :key="m.key"
          :to="m.to"
          class="h-8 rounded-md px-3 text-[13px] leading-8 font-semibold whitespace-nowrap transition-colors"
          :class="
            currentModule.key === m.key ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
          "
        >
          {{ m.label }}
        </NuxtLink>
      </nav>

      <button
        type="button"
        class="mx-auto hidden h-10 w-full max-w-sm items-center gap-2 rounded-full bg-subtle px-4 text-sm text-ink-muted hover:bg-divider lg:flex"
      >
        <Search :size="17" :stroke-width="1.75" aria-hidden="true" />
        <span>Rechercher…</span>
        <kbd class="ml-auto rounded border border-line bg-surface px-1.5 text-[11px] font-medium">Ctrl K</kbd>
      </button>

      <div class="ml-auto flex items-center gap-2">
        <span
          class="hidden items-center rounded-full bg-subtle px-3 py-1.5 text-xs font-medium whitespace-nowrap 2xl:flex"
        >
          <span class="tabular">{{ mission.clock }}</span>
        </span>
        <span
          class="hidden items-center gap-1.5 rounded-full bg-info-soft px-3 py-1.5 text-xs font-medium whitespace-nowrap text-info-ink xl:flex"
          :title="`Fonctionnement hors ligne. Prochaine fenêtre de contact avec la Terre dans ${mission.nextContact}.`"
        >
          <WifiOff :size="14" :stroke-width="2" aria-hidden="true" />
          Sol · {{ mission.nextContact }}
        </span>
        <button
          type="button"
          class="relative flex size-10 items-center justify-center rounded-md text-ink-muted hover:bg-subtle"
          aria-label="Alertes, 3 non lues"
        >
          <Bell :size="20" :stroke-width="1.75" aria-hidden="true" />
          <span
            class="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-white"
          >
            3
          </span>
        </button>
        <button
          type="button"
          class="hidden size-10 items-center justify-center rounded-md text-ink-muted hover:bg-subtle sm:flex"
          aria-label="Messages du sol"
        >
          <RadioTower :size="20" :stroke-width="1.75" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="hidden size-10 items-center justify-center rounded-md text-ink-muted hover:bg-subtle sm:flex"
          aria-label="Aide"
        >
          <CircleHelp :size="20" :stroke-width="1.75" aria-hidden="true" />
        </button>
        <NuxtLink
          to="/connexion"
          class="ml-1 rounded-full p-1 hover:bg-subtle"
          :aria-label="`${user.firstName} ${user.lastName}, changer de profil`"
        >
          <UiAvatar :initials="user.initials" :size="34" />
        </NuxtLink>
        <ShellEmergencyButton class="ml-1" />
      </div>
    </div>

    <nav aria-label="Navigation du module" class="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-6">
      <NuxtLink
        v-for="item in currentModule.items"
        :key="item.to"
        :to="item.to"
        class="relative flex h-11 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors"
        :class="isNavItemActive(item, route.path) ? 'text-ink' : 'text-ink-muted hover:text-ink'"
        :aria-current="isNavItemActive(item, route.path) ? 'page' : undefined"
      >
        <component :is="item.icon" :size="17" :stroke-width="1.75" aria-hidden="true" />
        {{ item.label }}
        <span
          v-if="isNavItemActive(item, route.path)"
          class="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-primary"
        />
      </NuxtLink>
    </nav>
  </header>
</template>
