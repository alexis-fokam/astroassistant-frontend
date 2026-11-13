// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

// Nuxt-aware ESLint rules; formatting is left to Prettier.
export default withNuxt(prettier, {
  rules: {
    // Optional TypeScript props already default to `undefined`.
    'vue/require-default-prop': 'off',
    // Formatting rules handled by Prettier.
    'vue/first-attribute-linebreak': 'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
})
