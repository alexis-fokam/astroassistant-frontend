<!-- Full-page frame for setup flows (Figma A-03, A-04): soft brand gradient, logo, actions on the right. -->
<template>
  <div
    class="min-h-dvh px-6 py-6 sm:px-10"
    style="
      background-image:
        radial-gradient(circle at 0% 0%, rgb(32 217 224 / 0.12), transparent 40%),
        radial-gradient(circle at 100% 100%, rgb(155 92 242 / 0.12), transparent 45%);
    "
  >
    <header class="flex items-center justify-between gap-4">
      <BrandLogo />
      <div class="flex items-center gap-3 text-sm text-ink-muted"><slot name="actions" /></div>
    </header>
    <slot />
  </div>
</template>
