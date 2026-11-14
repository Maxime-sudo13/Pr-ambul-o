import type { Question, Questionnaire, Session } from './types'

const yes = (questionId: string) => ({ questionId, op: 'is' as const, value: 'Oui' })

const general: Question[] = [
  { id: 'nom', section: 'Identité', label: 'Quel est votre nom de famille ?', short: 'Nom', type: 'text', required: true, role: 'lastName' },
  { id: 'prenom', section: 'Identité', label: 'Quel est votre prénom ?', short: 'Prénom', type: 'text', required: true, role: 'firstName' },
  { id: 'naissance', section: 'Identité', label: 'Quelle est votre date de naissance ?', short: 'Date de naissance', type: 'date', required: true, role: 'birthDate' },
  { id: 'sexe', section: 'Identité', label: 'Vous êtes…', short: 'Sexe', type: 'single', options: ['Une femme', 'Un homme', 'Je préfère ne pas répondre'], required: false },

  { id: 'motif', section: 'Motif de consultation', label: 'Pourquoi venez-vous aujourd’hui ?', short: 'Motif', type: 'longtext', required: true },
  { id: 'depuis', section: 'Motif de consultation', label: 'Depuis quand ?', short: 'Depuis', type: 'single', options: ['Aujourd’hui', 'Quelques jours', '1 à 4 semaines', 'Plus d’un mois'], required: false },
  { id: 'douleur', section: 'Motif de consultation', label: 'Avez-vous mal quelque part ?', short: 'Douleur', type: 'yesno', required: true },
  { id: 'douleur_ou', section: 'Motif de consultation', label: 'Où avez-vous mal ?', short: 'Localisation de la douleur', type: 'text', required: true, condition: yes('douleur') },
  { id: 'douleur_int', section: 'Motif de consultation', label: 'Quelle est l’intensité de la douleur ? (0 = aucune, 10 = insupportable)', short: 'Intensité déclarée', type: 'scale', required: false, condition: yes('douleur') },
  { id: 'fievre', section: 'Motif de consultation', label: 'Avez-vous de la fièvre ?', short: 'Fièvre', type: 'yesno', required: false },
  { id: 'fievre_temp', section: 'Motif de consultation', label: 'Quelle température avez-vous mesurée ?', short: 'Température mesurée', type: 'text', required: false, condition: yes('fievre') },

  { id: 'medic', section: 'Traitements et allergies', label: 'Prenez-vous des médicaments en ce moment ?', short: 'Médicaments en cours', type: 'yesno', required: true },
  { id: 'medic_liste', section: 'Traitements et allergies', label: 'Lesquels ? (nom et dose si vous les connaissez)', short: 'Médicaments en cours', type: 'longtext', required: true, condition: yes('medic') },
  { id: 'allergie', section: 'Traitements et allergies', label: 'Avez-vous des allergies connues ?', short: 'Allergies', type: 'yesno', required: true },
  { id: 'allergie_liste', section: 'Traitements et allergies', label: 'À quoi êtes-vous allergique ?', short: 'Allergies', type: 'text', required: true, condition: yes('allergie') },

  { id: 'chronique', section: 'Antécédents', label: 'Êtes-vous suivi(e) pour une maladie de longue durée ?', short: 'Maladie suivie', type: 'yesno', required: false },
  { id: 'chronique_liste', section: 'Antécédents', label: 'Laquelle ou lesquelles ?', short: 'Maladie suivie', type: 'text', required: false, condition: yes('chronique') },
  { id: 'operation', section: 'Antécédents', label: 'Avez-vous déjà été opéré(e) ?', short: 'Opérations', type: 'yesno', required: false },
  { id: 'operation_liste', section: 'Antécédents', label: 'Quelles opérations, et en quelle année ?', short: 'Opérations', type: 'longtext', required: false, condition: yes('operation') },
  { id: 'tabac', section: 'Antécédents', label: 'Fumez-vous ?', short: 'Tabac', type: 'single', options: ['Non', 'De temps en temps', 'Tous les jours', 'J’ai arrêté'], required: false },

  { id: 'autre', section: 'Autre', label: 'Souhaitez-vous signaler autre chose au médecin ?', short: 'Autre information', type: 'longtext', required: false },
]

const pediatrics: Question[] = [
  { id: 'nom', section: 'Identité de l’enfant', label: 'Nom de famille de l’enfant', short: 'Nom', type: 'text', required: true, role: 'lastName' },
  { id: 'prenom', section: 'Identité de l’enfant', label: 'Prénom de l’enfant', short: 'Prénom', type: 'text', required: true, role: 'firstName' },
  { id: 'naissance', section: 'Identité de l’enfant', label: 'Date de naissance de l’enfant', short: 'Date de naissance', type: 'date', required: true, role: 'birthDate' },
  { id: 'accomp', section: 'Identité de l’enfant', label: 'Qui accompagne l’enfant ?', short: 'Accompagnant', type: 'single', options: ['Mère', 'Père', 'Autre proche'], required: false },
  { id: 'motif', section: 'Motif de consultation', label: 'Pourquoi venez-vous aujourd’hui ?', short: 'Motif', type: 'longtext', required: true },
  { id: 'depuis', section: 'Motif de consultation', label: 'Depuis quand ?', short: 'Depuis', type: 'single', options: ['Aujourd’hui', 'Quelques jours', 'Plus d’une semaine'], required: false },
  { id: 'fievre', section: 'Motif de consultation', label: 'L’enfant a-t-il de la fièvre ?', short: 'Fièvre', type: 'yesno', required: true },
  { id: 'fievre_temp', section: 'Motif de consultation', label: 'Quelle température avez-vous mesurée ?', short: 'Température mesurée', type: 'text', required: false, condition: yes('fievre') },
  { id: 'signes', section: 'Motif de consultation', label: 'Avez-vous remarqué l’un de ces signes ?', short: 'Signes remarqués', type: 'multi', options: ['Toux', 'Vomissements', 'Diarrhée', 'Boutons ou plaques', 'Mange ou boit moins', 'Dort mal'], required: false },
  { id: 'medic', section: 'Traitements et allergies', label: 'L’enfant prend-il des médicaments en ce moment ?', short: 'Médicaments en cours', type: 'yesno', required: true },
  { id: 'medic_liste', section: 'Traitements et allergies', label: 'Lesquels ?', short: 'Médicaments en cours', type: 'longtext', required: true, condition: yes('medic') },
  { id: 'allergie', section: 'Traitements et allergies', label: 'L’enfant a-t-il des allergies connues ?', short: 'Allergies', type: 'yesno', required: true },
  { id: 'allergie_liste', section: 'Traitements et allergies', label: 'À quoi ?', short: 'Allergies', type: 'text', required: true, condition: yes('allergie') },
  { id: 'vaccins', section: 'Traitements et allergies', label: 'Les vaccins sont-ils à jour ?', short: 'Vaccins à jour', type: 'single', options: ['Oui', 'Non', 'Je ne sais pas'], required: false },
  { id: 'autre', section: 'Autre', label: 'Souhaitez-vous signaler autre chose au médecin ?', short: 'Autre information', type: 'longtext', required: false },
]

export interface Template {
  key: string
  name: string
  description: string
  build: () => Questionnaire
}

const clone = (qs: Question[]): Question[] => JSON.parse(JSON.stringify(qs))

export const TEMPLATES: Template[] = [
  {
    key: 'general',
    name: 'Médecine générale',
    description: 'Identité, motif, douleur, traitements, allergies, antécédents.',
    build: () => ({ title: 'Médecine générale', questions: clone(general) }),
  },
  {
    key: 'pediatrics',
    name: 'Pédiatrie',
    description: 'Questionnaire rempli par le parent qui accompagne l’enfant.',
    build: () => ({ title: 'Pédiatrie', questions: clone(pediatrics) }),
  },
  {
    key: 'blank',
    name: 'Partir de zéro',
    description: 'Seulement nom, prénom et date de naissance. Vous ajoutez le reste.',
    build: () => ({ title: 'Mon questionnaire', questions: clone(general.slice(0, 3)) }),
  },
]

/** Patients fictifs pour que la démo ne soit pas vide. */
export function exampleSessions(): Session[] {
  const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString()
  return [
    {
      id: 'exemple-1',
      createdAt: at(12),
      consentAt: at(16),
      example: true,
      questions: clone(general),
      answers: {
        nom: 'Lambert', prenom: 'Claire', naissance: '1971-03-08', sexe: 'Une femme',
        motif: 'Mal au genou droit depuis une chute dans l’escalier. J’ai du mal à descendre les marches.',
        depuis: 'Quelques jours', douleur: 'Oui', douleur_ou: 'Genou droit, côté intérieur', douleur_int: '6',
        fievre: 'Non', medic: 'Oui', medic_liste: 'Lévothyrox 75 µg le matin\nParacétamol 1 g depuis la chute',
        allergie: 'Oui', allergie_liste: 'Pénicilline', chronique: 'Oui', chronique_liste: 'Hypothyroïdie',
        operation: 'Oui', operation_liste: 'Appendicite (1995)\nCésarienne (2004)', tabac: 'J’ai arrêté',
      },
    },
    {
      id: 'exemple-2',
      createdAt: at(47),
      consentAt: at(50),
      example: true,
      questions: clone(general),
      answers: {
        nom: 'Moreau', prenom: 'Julien', naissance: '1996-11-21', sexe: 'Un homme',
        motif: 'Toux et mal de gorge. J’ai besoin d’un certificat pour reprendre le sport en club.',
        depuis: 'Quelques jours', douleur: 'Non', fievre: 'Oui', fievre_temp: '38,4 hier soir',
        medic: 'Non', allergie: 'Non', chronique: 'Non', operation: 'Non', tabac: 'De temps en temps',
      },
    },
  ]
}
