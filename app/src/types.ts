export type QuestionType =
  | 'text'
  | 'longtext'
  | 'yesno'
  | 'single'
  | 'multi'
  | 'scale'
  | 'date'
  | 'number'

export const TYPE_LABELS: Record<QuestionType, string> = {
  text: 'Texte court',
  longtext: 'Texte long',
  yesno: 'Oui / Non',
  single: 'Choix unique',
  multi: 'Choix multiple',
  scale: 'Échelle 0 à 10',
  date: 'Date',
  number: 'Nombre',
}

/** Afficher la question seulement si la réponse à une autre question correspond. */
export interface Condition {
  questionId: string
  op: 'is' | 'isNot'
  value: string
}

export interface Question {
  id: string
  section: string
  /** Texte posé au patient. */
  label: string
  /** Libellé court utilisé dans la synthèse du médecin. */
  short?: string
  type: QuestionType
  options?: string[]
  required: boolean
  condition?: Condition
  /** Sert à construire l'en-tête d'identité de la synthèse. */
  role?: 'lastName' | 'firstName' | 'birthDate'
}

export interface Questionnaire {
  title: string
  questions: Question[]
}

export type Answer = string | string[]
export type Answers = Record<string, Answer>

export interface Session {
  id: string
  createdAt: string
  consentAt: string
  /** Copie des questions telles qu'elles ont été posées. */
  questions: Question[]
  answers: Answers
  example?: boolean
  /** Date à laquelle le médecin a ouvert la synthèse. */
  seenAt?: string
}

export interface AppState {
  questionnaire: Questionnaire | null
  sessions: Session[]
  /** Code demandé pour quitter le mode patient sur la tablette. */
  exitCode: string
}
