/** Attribut `lang` du document selon la langue choisie (accessibilité, lecteurs d'écran). */
export default defineNuxtPlugin(() => {
  const { locale } = useI18n()
  useHead({ htmlAttrs: { lang: () => locale.value } })
})
