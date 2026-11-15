/** Public website navigation and footer (Figma P-02, P-03 header and footer). */

export const SITE_LINKS = [
  { to: '/fonctionnalites', label: 'Fonctionnalités' },
  { to: '/fonctionnement', label: 'Comment ça marche' },
  { to: '/donnees-nasa', label: 'Données NASA' },
  { to: '/scenarios', label: 'Scénarios' },
  { to: '/equipe', label: 'Équipe' },
]

export const API_DOCS_URL = 'http://localhost:8000/docs'
export const REPOSITORY_URL = 'https://github.com/alexis-fokam/astroassistant-backend'

export const FOOTER_COLUMNS = [
  {
    title: 'Produit',
    links: [
      { to: '/fonctionnalites', label: 'Fonctionnalités' },
      { to: '/fonctionnement', label: 'Comment ça marche' },
      { to: '/scenarios', label: 'Scénarios de démo' },
      { to: '/simulation', label: 'Lancer la démo' },
    ],
  },
  {
    title: 'Science',
    links: [
      { to: '/donnees-nasa', label: 'Données NASA' },
      { to: '/donnees-nasa', label: 'NASA OSDR' },
      { to: '/donnees-nasa', label: 'NASA DONKI' },
      { to: '/donnees-nasa', label: 'NASA-STD-3001' },
    ],
  },
  {
    title: 'Projet',
    links: [
      { to: '/equipe', label: 'Équipe' },
      { to: '/ressources', label: 'Ressources' },
      { to: REPOSITORY_URL, label: 'GitHub' },
      { to: API_DOCS_URL, label: 'Swagger /docs' },
    ],
  },
]
