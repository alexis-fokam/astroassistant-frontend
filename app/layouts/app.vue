<!-- Signed-in application shell: header with module navigation, page body, floating assistant. -->
<template>
  <div class="min-h-dvh pb-24">
    <ShellHeader />
    <main class="mx-auto max-w-[1440px] px-6 py-6">
      <slot />
    </main>
    <ShellAskAstro />
  </div>
</template>
