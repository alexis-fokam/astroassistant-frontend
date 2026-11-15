/**
 * Bilinguisme français / anglais de l'application (cahier des charges : interface FR / EN).
 *
 * Le texte français sert de clé : `t('Comment ça marche')` renvoie « How it works » en
 * anglais, et le texte d'origine tant qu'aucune traduction n'existe. Les écrans se traduisent
 * donc progressivement, sans jamais afficher de clé technique. La langue choisie est gardée
 * dans un cookie (lisible au rendu serveur, aucun clignotement).
 */
import { EN } from '~/constants/translations'

export type Locale = 'fr' | 'en'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
]

export function useI18n() {
  const locale = useCookie<Locale>('aa_lang', { default: () => 'fr', sameSite: 'lax', maxAge: 31536000 })

  /** Traduit un texte français ; `{nom}` est remplacé par `params.nom`. */
  function t(text: string, params?: Record<string, string | number>): string {
    const translated = locale.value === 'en' ? (EN[text] ?? text) : text
    if (!params) return translated
    return translated.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`))
  }

  function setLocale(code: Locale) {
    locale.value = code
  }

  return { locale, t, setLocale }
}
