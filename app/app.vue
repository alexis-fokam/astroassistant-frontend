<script setup lang="ts">
useHead({
  titleTemplate: (title) =>
    title && title !== 'Astro Assistant' ? `${title} · Astro Assistant` : 'Astro Assistant',
  link: [{ rel: 'icon', type: 'image/webp', href: '/brand/logo-astroassistant.webp' }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
