<script setup lang="ts">
import { Bell, CircleHelp, Inbox, LayoutGrid, LogOut, Search, Settings, WifiOff } from 'lucide-vue-next'
import { APP_MODULES } from '~/constants/navigation'
import { isNavItemActive, moduleForPath } from '~/utils/navigation'

// Horizontal app header (Figma E-01): brand, module switcher, search, notifications,
// current profile and emergency button; second row holds the module navigation.
const route = useRoute()
const { mission, currentCrew, findCrew } = useMissionData()
const { isLoggedIn, logout } = useAuth()
const { t } = useI18n()

const currentModule = computed(() => moduleForPath(route.path))

// Profile shown in the header: the CMO in the medical module, the jury in demo mode,
// otherwise the signed-in astronaut.
const user = computed(() => {
  if (currentModule.value.key === 'simulation') {
    return { name: t('Jury'), initials: 'JU', tone: 1, role: t('Mode démonstration') }
  }
  const member = currentModule.value.key === 'cmo' ? findCrew('AV-04')! : currentCrew
  const role = currentModule.value.key === 'cmo' ? 'Médecin de bord' : 'Astronaute'
  return {
    name: `${member.firstName} ${member.lastName}`,
    initials: member.initials,
    tone: member.tone,
    role: `${member.code} · ${role}`,
  }
})
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-divider bg-surface">
    <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-5 px-6">
      <BrandLogo :to="currentModule.to" />

      <nav aria-label="Modules" class="flex items-center gap-1 rounded-lg bg-subtle p-1">
        <NuxtLink
          v-for="m in APP_MODULES"
          :key="m.key"
          :to="m.to"
          class="h-8 rounded-md px-3 text-[13px] leading-8 font-medium whitespace-nowrap transition-colors"
          :class="
            currentModule.key === m.key
              ? 'bg-surface text-primary shadow-hover'
              : 'text-ink-muted hover:text-ink'
          "
          :aria-current="currentModule.key === m.key ? 'page' : undefined"
        >
          {{ t(m.label) }}
        </NuxtLink>
      </nav>

      <button
        type="button"
        class="hidden h-9 w-56 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-ink-muted hover:border-ink-faint lg:flex"
      >
        <Search :size="16" :stroke-width="1.7" aria-hidden="true" />
        <span>{{ t('Rechercher') }}</span>
        <kbd class="ml-auto rounded bg-subtle px-1.5 text-[11px] font-medium">Ctrl K</kbd>
      </button>

      <div class="ml-auto flex items-center gap-1">
        <button
          type="button"
          class="relative flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle"
          aria-label="Alertes, 3 non lues"
        >
          <Bell :size="20" :stroke-width="1.7" aria-hidden="true" />
          <span
            class="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-white"
            >3</span
          >
        </button>
        <button
          type="button"
          class="relative flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle"
          aria-label="Messages du sol, 1 non lu"
        >
          <Inbox :size="20" :stroke-width="1.7" aria-hidden="true" />
          <span
            class="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >1</span
          >
        </button>
        <button
          type="button"
          class="hidden size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle sm:flex"
          aria-label="Aide"
        >
          <CircleHelp :size="20" :stroke-width="1.7" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="hidden size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle sm:flex"
          :aria-label="t('Modules et outils')"
        >
          <LayoutGrid :size="20" :stroke-width="1.7" aria-hidden="true" />
        </button>
        <NuxtLink
          to="/equipage/parametres"
          class="hidden size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle sm:flex"
          :aria-label="t('Paramètres')"
        >
          <Settings :size="20" :stroke-width="1.7" aria-hidden="true" />
        </NuxtLink>

        <UiLanguageSwitch class="ml-1" />
        <NuxtLink
          to="/connexion"
          class="ml-2 flex items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 hover:bg-subtle"
          :aria-label="t('{name}, changer de profil', { name: user.name })"
        >
          <UiAvatar :initials="user.initials" :tone="user.tone" :size="34" />
          <span class="hidden leading-tight xl:block">
            <span class="block text-sm font-semibold">{{ user.name }}</span>
            <span class="block text-xs text-ink-muted">{{ user.role }}</span>
          </span>
        </NuxtLink>
        <button
          v-if="isLoggedIn"
          type="button"
          class="flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle hover:text-ink"
          :aria-label="t('Se déconnecter')"
          :title="t('Se déconnecter')"
          @click="logout"
        >
          <LogOut :size="20" :stroke-width="1.7" aria-hidden="true" />
        </button>
        <ShellEmergencyButton class="ml-2" />
      </div>
    </div>

    <div class="mx-auto flex max-w-[1440px] items-center gap-4 px-6">
      <nav :aria-label="t('Navigation du module')" class="flex flex-1 gap-1 overflow-x-auto">
        <NuxtLink
          v-for="item in currentModule.items"
          :key="item.to"
          :to="item.to"
          class="relative flex h-11 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors"
          :class="isNavItemActive(item, route.path) ? 'text-primary' : 'text-ink-muted hover:text-ink'"
          :aria-current="isNavItemActive(item, route.path) ? 'page' : undefined"
        >
          <component :is="item.icon" :size="16" :stroke-width="1.7" aria-hidden="true" />
          {{ t(item.label) }}
          <span
            v-if="isNavItemActive(item, route.path)"
            class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
          />
        </NuxtLink>
      </nav>
      <span
        class="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs whitespace-nowrap text-ink-muted md:flex"
        :title="`Fonctionnement hors ligne. Prochaine fenêtre de contact avec la Terre dans ${mission.nextContact}.`"
      >
        <WifiOff :size="13" aria-hidden="true" />
        <span class="tabular">{{ mission.clock }} · sol dans {{ mission.nextContact }}</span>
      </span>
    </div>
  </header>
</template>
