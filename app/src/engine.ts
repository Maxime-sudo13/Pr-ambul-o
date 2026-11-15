import type { Answer, Answers, Question, Session } from './types'

export const YES = 'Oui'
export const NO = 'Non'

export function isAnswered(a: Answer | undefined): boolean {
  if (a === undefined) return false
  return Array.isArray(a) ? a.length > 0 : a.trim() !== ''
}

export function isVisible(q: Question, questions: Question[], answers: Answers, depth = 0): boolean {
  if (!q.condition) return true
  if (depth > 20) return false
  const target = questions.find((x) => x.id === q.condition!.questionId)
  if (!target) return true
  if (!isVisible(target, questions, answers, depth + 1)) return false
  const a = answers[target.id]
  if (!isAnswered(a)) return false
  const match = Array.isArray(a) ? a.includes(q.condition.value) : a === q.condition.value
  return q.condition.op === 'is' ? match : !match
}

export function visibleQuestions(questions: Question[], answers: Answers): Question[] {
  return questions.filter((q) => isVisible(q, questions, answers))
}

/** Une question sans texte, ou à choix sans aucun choix, ne doit jamais être posée au patient. */
export function isUsable(q: Question): boolean {
  if (!q.label.trim()) return false
  if (q.type === 'single' || q.type === 'multi') return (q.options ?? []).some((o) => o.trim())
  return true
}

/** Jour, mois, année saisis séparément → date ISO, ou '' si la date est incomplète, impossible ou future. */
export function toIsoDate(day: string, month: string, year: string, today = new Date()): string {
  const d = Number(day)
  const m = Number(month)
  const y = Number(year)
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return ''
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return ''
  if (y < 1900 || date.getTime() > today.getTime()) return ''
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Options proposées pour une question à choix (utile pour les conditions). */
export function choicesOf(q: Question): string[] {
  if (q.type === 'yesno') return [YES, NO]
  if (q.type === 'single' || q.type === 'multi') return q.options ?? []
  return []
}

export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ageFrom(birthIso: string, at: Date): number | undefined {
  const b = new Date(birthIso)
  if (isNaN(b.getTime())) return undefined
  let age = at.getFullYear() - b.getFullYear()
  const beforeBirthday =
    at.getMonth() < b.getMonth() || (at.getMonth() === b.getMonth() && at.getDate() < b.getDate())
  if (beforeBirthday) age--
  return age >= 0 && age < 130 ? age : undefined
}

export function display(q: Question, a: Answer): string {
  if (Array.isArray(a)) return a.join(', ')
  if (q.type === 'date') return formatDate(a)
  if (q.type === 'scale') return `${a}/10`
  return a.trim()
}

export interface SynthesisSection {
  title: string
  lines: { label: string; value: string }[]
  /** Questions Oui/Non auxquelles le patient a répondu Non. */
  negatives: string[]
}

export interface Synthesis {
  patientName: string
  birthDate?: string
  age?: number
  sections: SynthesisSection[]
}

/**
 * Synthèse strictement factuelle : on réorganise ce que le patient a déclaré,
 * sans interprétation, sans score, sans suggestion.
 */
export function buildSynthesis(session: Session): Synthesis {
  const { questions, answers } = session
  const byRole = (role: Question['role']) => {
    const q = questions.find((x) => x.role === role)
    const a = q ? answers[q.id] : undefined
    return typeof a === 'string' ? a.trim() : ''
  }
  const last = byRole('lastName')
  const first = byRole('firstName')
  const birth = byRole('birthDate')

  const shown = visibleQuestions(questions, answers)
  /** Un « Oui » déjà détaillé par une question de suivi n'apporte rien : on ne garde que le détail. */
  const detailed = (q: Question) =>
    shown.some((f) => f.condition?.questionId === q.id && f.condition.op === 'is' && f.condition.value === YES && isAnswered(answers[f.id]))

  const sections: SynthesisSection[] = []
  for (const q of shown) {
    if (q.role) continue
    const a = answers[q.id]
    if (!isAnswered(a)) continue
    if (q.type === 'yesno' && a === YES && detailed(q)) continue
    let section = sections.find((s) => s.title === q.section)
    if (!section) {
      section = { title: q.section, lines: [], negatives: [] }
      sections.push(section)
    }
    const label = q.short?.trim() || q.label
    if (q.type === 'yesno' && a === NO) section.negatives.push(label)
    else section.lines.push({ label, value: display(q, a!) })
  }

  return {
    patientName: [last.toUpperCase(), first].filter(Boolean).join(' ') || 'Patient sans nom',
    birthDate: birth ? formatDate(birth) : undefined,
    age: birth ? ageFrom(birth, new Date(session.createdAt)) : undefined,
    sections,
  }
}

export function synthesisToText(session: Session): string {
  const s = buildSynthesis(session)
  const out: string[] = []
  const id = [s.patientName, s.birthDate && `né(e) le ${s.birthDate}`, s.age !== undefined && `${s.age} ans`]
    .filter(Boolean)
    .join(' — ')
  out.push(id, `Pré-consultation du ${formatDateTime(session.createdAt)} (déclaré par le patient)`, '')
  for (const sec of s.sections) {
    out.push(sec.title.toUpperCase())
    for (const l of sec.lines) out.push(`- ${l.label} : ${l.value}`)
    if (sec.negatives.length) out.push(`- Répond non à : ${sec.negatives.join(' ; ')}`)
    out.push('')
  }
  return out.join('\n').trim()
}

export function sessionToJson(session: Session): string {
  const data = {
    id: session.id,
    date: session.createdAt,
    consentement: session.consentAt,
    reponses: visibleQuestions(session.questions, session.answers)
      .filter((q) => isAnswered(session.answers[q.id]))
      .map((q) => ({ section: q.section, question: q.label, type: q.type, reponse: session.answers[q.id] })),
  }
  return JSON.stringify(data, null, 2)
}

export function sessionToCsv(session: Session): string {
  // Un texte libre commençant par = + - @ serait exécuté comme une formule par un tableur :
  // on le neutralise avec une apostrophe.
  const esc = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`
  const rows = [['Section', 'Question', 'Réponse'].map(esc).join(';')]
  for (const q of visibleQuestions(session.questions, session.answers)) {
    const a = session.answers[q.id]
    if (!isAnswered(a)) continue
    rows.push([q.section, q.label, display(q, a!)].map(esc).join(';'))
  }
  // BOM pour qu'Excel lise correctement les accents.
  return '﻿' + rows.join('\r\n')
}

export function download(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function newId(): string {
  return crypto.randomUUID()
}
