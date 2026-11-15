/**
 * Traductions anglaises. Clé = texte français affiché à l'écran, valeur = texte anglais.
 * Ajouter ici chaque nouveau texte d'interface passé à `t()`.
 */
export const EN: Record<string, string> = {
  // ------------------------------------------------------------------ commun
  Langue: 'Language',
  Rechercher: 'Search',
  Paramètres: 'Settings',
  Urgence: 'Emergency',
  'Se déconnecter': 'Sign out',
  Retour: 'Back',
  Continuer: 'Continue',
  Annuler: 'Cancel',
  Enregistrer: 'Save',
  Envoyer: 'Send',
  'Hors ligne': 'Offline',
  'Mode démonstration': 'Demo mode',
  Jury: 'Jury',
  Astronaute: 'Astronaut',
  'Médecin de bord': 'Crew medical officer',
  'Médecin de bord (CMO)': 'Crew medical officer (CMO)',
  'Commandant·e': 'Commander',
  'Ingénieur·e de vol': 'Flight engineer',
  'Spécialiste de mission': 'Mission specialist',
  Pilote: 'Pilot',
  'Spécialiste charge utile': 'Payload specialist',
  'Modules et outils': 'Modules and tools',
  'Navigation du module': 'Module navigation',
  '{name}, changer de profil': '{name}, switch profile',
  'Prototype — n’est pas un dispositif médical certifié.': 'Prototype — not a certified medical device.',

  // ------------------------------------------------------------------ site public
  Fonctionnalités: 'Features',
  'Comment ça marche': 'How it works',
  'Données NASA': 'NASA data',
  Scénarios: 'Scenarios',
  Équipe: 'Team',
  'Docs API': 'API docs',
  'Lancer la démo': 'Launch the demo',
  Produit: 'Product',
  Science: 'Science',
  Projet: 'Project',
  'Scénarios de démo': 'Demo scenarios',
  Ressources: 'Resources',
  'Le médecin de bord intelligent, 100 % hors ligne, conçu pour les missions longue durée.':
    'The smart onboard doctor, 100% offline, built for long-duration missions.',

  // ------------------------------------------------------------------ modules de l'application
  Équipage: 'Crew',
  'Tableau de bord': 'Dashboard',
  Systèmes: 'Systems',
  'Check-in': 'Check-in',
  Protocoles: 'Protocols',
  Dosimétrie: 'Dosimetry',
  Exercices: 'Exercise',
  Sommeil: 'Sleep',
  'Test PVT': 'PVT test',
  Plus: 'More',
  'File d’alertes': 'Alert queue',
  'Dossiers médicaux': 'Medical records',
  Pharmacie: 'Pharmacy',
  'Journal d’audit': 'Audit trail',
  'Liaison sol': 'Ground link',
  Synchronisation: 'Synchronisation',
  'Consignes du sol': 'Ground instructions',
  Paquets: 'Packets',
  'Fenêtres de contact': 'Contact windows',
  Simulation: 'Simulation',
  'Panneau de contrôle': 'Control panel',
  'Journal moteur': 'Engine log',

  // ------------------------------------------------------------------ connexion
  Connexion: 'Sign in',
  'Qui utilise le poste ?': 'Who is using this station?',
  'Profils locaux, données chiffrées sur l’appareil. Aucune connexion requise.':
    'Local profiles, data encrypted on the device. No connection required.',
  Profil: 'Profile',
  'Profil CMO · accès à tout l’équipage': 'CMO profile · access to the whole crew',
  'Accès à vos propres données': 'Access to your own data',
  Effacer: 'Delete',
  Déverrouiller: 'Unlock',
  '{n} tentatives restantes, puis verrouillage 5 min.': '{n} attempts left, then a 5-minute lock.',
  'Mode démonstration : serveur injoignable, n’importe quel code à 4 chiffres.':
    'Demo mode: server unreachable, any 4-digit code works.',
  '{n} chiffres saisis sur {total}': '{n} of {total} digits entered',
  'Identifiant ou PIN incorrect': 'Wrong crew ID or PIN',

  // ------------------------------------------------------------------ urgence
  'Déclencher le mode urgence ?': 'Trigger emergency mode?',
  'Tout l’équipage sera alerté et un paquet CRITICAL passera en tête de la file vers le sol.':
    'The whole crew will be alerted and a CRITICAL packet will lead the queue to the ground.',
  'Maintenir 2 secondes pour confirmer': 'Hold 2 seconds to confirm',
  'Relâcher annule. Aucune action en un seul geste.': 'Releasing cancels. No action in a single gesture.',

  // ------------------------------------------------------------------ simulation (démo jury)
  'Simulation & démo jury': 'Simulation & jury demo',
  'Données simulées, aucun capteur réel · rejouez les scénarios de référence':
    'Simulated data, no real sensor · replay the reference scenarios',
  Réinitialiser: 'Reset',
  'Visite guidée': 'Guided tour',
  'Injecter une anomalie en direct': 'Inject a live anomaly',
  'Horloge simulée': 'Simulated clock',
  mesures: 'readings',
  'Tout l’équipage': 'Whole crew',
  intensité: 'intensity',
  'Journal moteur en direct': 'Live engine log',
  'WS connecté': 'WS connected',
  'Lancez un scénario ou injectez une anomalie : le moteur IA réagit ici en direct.':
    'Start a scenario or inject an anomaly: the AI engine reacts here live.',
  'Tachycardie et désaturation': 'Tachycardia and desaturation',
  'Chute de SpO₂': 'SpO₂ drop',
  Fièvre: 'Fever',
  'Stress et dette de sommeil': 'Stress and sleep debt',
  'Tempête solaire': 'Solar storm',
  'Suspicion SANS': 'Suspected SANS',
  Déconditionnement: 'Deconditioning',
  'FC qui monte vers 130 bpm, SpO₂ qui descend vers 92 %':
    'Heart rate rising to 130 bpm, SpO₂ falling to 92%',
  'SpO₂ qui descend vers 88 %': 'SpO₂ falling to 88%',
  'Température qui monte vers 38,7 °C': 'Temperature rising to 38.7 °C',
  'VFC à 60 % de la baseline, 3 nuits < 6 h, stress déclaré 8/10':
    'HRV at 60% of baseline, 3 nights < 6 h, self-reported stress 8/10',
  'Flux de protons GOES > 10 pfu puis débit de dose 1,8 mSv/h':
    'GOES proton flux > 10 pfu, then dose rate 1.8 mSv/h',
  'Vision floue et céphalées déclarées deux jours de suite':
    'Blurred vision and headaches reported two days in a row',
  'Trois séances de résistance (ARED) manquées': 'Three resistance (ARED) sessions missed',

  'Attendu : {level}': 'Expected: {level}',
  'En cours': 'Running',
  Injecter: 'Inject',
  'Accélération du temps': 'Time acceleration',
  '1 jour simulé = {n} min': '1 simulated day = {n} min',
  'fois {n}': 'times {n}',
  Pause: 'Pause',
  Lecture: 'Play',
  'Équipage virtuel': 'Virtual crew',
  libre: 'free',
  'Simuler {code}': 'Simulate {code}',
  'Graine aléatoire': 'Random seed',
  'Journée nominale': 'Nominal day',
  'Paramètres stables, statut vert, rappels d’exercice et de check-in.':
    'Stable parameters, green status, exercise and check-in reminders.',
  "Paramètres stables, statut vert, rappels d'exercice et de check-in.":
    'Stable parameters, green status, exercise and check-in reminders.',
  'VFC en baisse sur 3 jours et sommeil < 6 h.': 'HRV falling over 3 days and sleep < 6 h.',
  'VFC en baisse sur 3 jours et sommeil < 6 h : WARNING.':
    'HRV falling over 3 days and sleep < 6 h: WARNING.',
  'Événement à particules solaires': 'Solar particle event',
  'Pic de débit de dose : abri immédiat et minuteur.': 'Dose-rate spike: immediate shelter and timer.',
  "Pic de débit de dose : CRITICAL, consigne d'abri et minuteur.":
    'Dose-rate spike: CRITICAL, shelter order and timer.',
  'Vision floue et maux de tête répétés : test visuel guidé.':
    'Blurred vision and repeated headaches: guided vision test.',
  'Vision floue déclarée et maux de tête répétés : WARNING, test visuel.':
    'Reported blurred vision and repeated headaches: WARNING, vision test.',
  'Séances manquées : projection de perte osseuse aggravée.':
    'Missed sessions: worsened bone-loss projection.',
  "Séances d'exercice manquées : projection de perte osseuse aggravée.":
    'Missed exercise sessions: worsened bone-loss projection.',
  'Fenêtre de contact': 'Contact window',
  'Paquet de synthèse transmis au sol, consigne reçue.':
    'Summary packet sent to the ground, instruction received.',
  "Paquet de synthèse transmis au sol, puis réception d'une consigne.":
    'Summary packet sent to the ground, then an instruction received.',

  // ------------------------------------------------------------------ erreurs
  'Page introuvable': 'Page not found',
  'Une erreur est survenue': 'Something went wrong',
  'Cette page n’existe pas ou a été déplacée.': 'This page does not exist or has moved.',
  'L’application a rencontré un problème. Vos données à bord sont intactes.':
    'The application ran into a problem. Your onboard data are safe.',
  'Revenir à l’accueil': 'Back to home',
  Réessayer: 'Try again',
  'Serveur Astro Assistant injoignable': 'Astro Assistant server unreachable',
  'Session invalide ou expirée': 'Invalid or expired session',
  'Authentification requise': 'Sign-in required',
  'Accès limité à vos propres données': 'Access limited to your own data',
  'Réservé au médecin de bord': 'Crew medical officer only',
  'Données invalides': 'Invalid data',
  'Erreur interne du serveur : l’incident est journalisé.':
    'Internal server error: the incident has been logged.',
}
