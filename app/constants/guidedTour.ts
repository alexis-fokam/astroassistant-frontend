/** Jury walkthrough steps (spec §16 demo flow, Figma "D-04 · Visite guidée du jury"). */
export interface TourStep {
  short: string
  title: string
  text: string
  /** Page shown behind the tour card for this step. */
  route: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    short: 'Le problème : 22 min de latence',
    title: 'Aucun médecin à portée',
    text: 'Vers Mars, un message met jusqu’à 22 minutes pour arriver. L’équipage doit détecter, comprendre et agir seul : Astro Assistant tourne entièrement à bord.',
    route: '/simulation',
  },
  {
    short: 'Le statut en 3 s',
    title: 'Le statut se lit en 3 secondes',
    text: 'Couleur, icône et texte : même un daltonien ou un astronaute fatigué comprend tout de suite. Ici, le moteur a détecté une baisse de VFC.',
    route: '/equipage',
  },
  {
    short: 'L’explication IA',
    title: 'Chaque alerte s’explique',
    text: 'Les trois facteurs principaux, la règle déclenchée et la sortie du modèle sont visibles. Rien n’est une boîte noire.',
    route: '/equipage/systemes/behavioral',
  },
  {
    short: 'Le protocole guidé',
    title: 'Une alerte devient un plan d’action',
    text: 'Le protocole guide l’astronaute étape par étape, avec un minuteur de respiration. Il ne prescrit jamais de médicament.',
    route: '/equipage/protocoles/PRT-STRESS-01',
  },
  {
    short: 'L’alerte éruption solaire',
    title: 'Une éruption solaire en direct',
    text: 'Le scénario S3 rejoue un événement réel de la base DONKI : statut CRITICAL, consigne d’abri et compte à rebours.',
    route: '/equipage/dosimetrie',
  },
  {
    short: 'La synchronisation sol',
    title: 'Tout part vers la Terre',
    text: 'À chaque fenêtre de contact, un paquet compressé et signé part vers le sol. Les alertes critiques passent toujours en premier.',
    route: '/sol',
  },
]
