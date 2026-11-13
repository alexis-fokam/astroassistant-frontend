/** Instructions received from the ground (backend table ground_messages, spec F10.4). */
export interface GroundMessage {
  id: number
  author: string
  initials: string
  tone: number
  role: string
  subject: string
  receivedAt: string
  sentAt: string
  unread: boolean
  isInstruction: boolean
  /** Paragraphs; **bold** segments are rendered in bold. */
  body: string[]
  attachment?: string
}

export const GROUND_MESSAGES: GroundMessage[] = [
  {
    id: 7,
    author: 'Dr Maya Reyes',
    initials: 'MR',
    tone: 1,
    role: 'Flight surgeon · Houston',
    subject: 'Prolonger la fenêtre de sommeil',
    receivedAt: 'J+141 17:02',
    sentAt: '16:50',
    unread: true,
    isInstruction: true,
    body: [
      'Bonjour Léo,',
      'Nous avons reçu le paquet de synthèse de J+141. Votre VFC est en baisse et la dette de sommeil s’accumule.',
      '**Consigne :** prolongez votre fenêtre de sommeil de **45 minutes pendant 3 nuits**, coucher à 22:45. Merci de refaire un test PVT avant l’EVA de J+143.',
      'Nous réévaluerons votre VFC à J+144.',
      'Maya',
    ],
    attachment: 'synthese_AV-02_J141.json.gz',
  },
  {
    id: 6,
    author: 'Dr Maya Reyes',
    initials: 'MR',
    tone: 1,
    role: 'Flight surgeon · Houston',
    subject: 'Résultats de l’OCT de Kenji',
    receivedAt: 'J+140 19:55',
    sentAt: '19:43',
    unread: false,
    isInstruction: false,
    body: ['Bonjour,', 'Les images OCT de Kenji sont dans les normes. Revoir dans 7 jours.', 'Maya'],
  },
  {
    id: 5,
    author: 'Houston',
    initials: 'HC',
    tone: 2,
    role: 'Centre de contrôle',
    subject: 'Fenêtre de contact décalée de 20 min',
    receivedAt: 'J+139 08:30',
    sentAt: '08:18',
    unread: false,
    isInstruction: false,
    body: [
      'La fenêtre de contact de J+139 est décalée de 20 minutes en raison de l’orientation de l’antenne.',
    ],
  },
  {
    id: 4,
    author: 'Dr Maya Reyes',
    initials: 'MR',
    tone: 1,
    role: 'Flight surgeon · Houston',
    subject: 'Bilan hebdomadaire reçu, RAS',
    receivedAt: 'J+135 18:10',
    sentAt: '17:58',
    unread: false,
    isInstruction: false,
    body: ['Bilan hebdomadaire bien reçu. Rien à signaler.', 'Maya'],
  },
]
