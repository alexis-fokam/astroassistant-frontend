<script setup lang="ts">
import { Bell, Inbox, LogOut, WifiOff } from 'lucide-vue-next'
import { APP_MODULES } from '~/constants/navigation'
import { isNavItemActive, moduleForPath } from '~/utils/navigation'

// En-tête de l'application (Figma E-01) : logo, modules, alertes et messages, profil courant
// et bouton d'urgence ; la deuxième ligne porte la navigation du module.
const route = useRoute()
const { mission, currentCrew, findCrew, alerts } = useMissionData()
const { isLoggedIn, logout } = useAuth()
const { t } = useI18n()

const currentModule = computed(() => moduleForPath(route.path))

// Profil affiché : le médecin de bord dans le module médical, le jury en démo,
// sinon l'astronaute connecté.
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

// Alertes non résolues (vraies données du moteur) ; la cloche mène à la file d'alertes.
const openAlerts = computed(() => alerts.filter((a) => a.status !== 'resolved').length)
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


      <div class="ml-auto flex items-center gap-1">
        <NuxtLink
          to="/cmo#alertes"
          class="relative flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle"
          :aria-label="t('Alertes, {n} non résolues', { n: openAlerts })"
        >
          <Bell :size="20" :stroke-width="1.7" aria-hidden="true" />
          <span
            v-if="openAlerts"
            class="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-white"
            >{{ openAlerts }}</span
          >
        </NuxtLink>
        <NuxtLink
          to="/equipage/messages"
          class="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle"
          :aria-label="t('Messages du sol')"
        >
          <Inbox :size="20" :stroke-width="1.7" aria-hidden="true" />
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
