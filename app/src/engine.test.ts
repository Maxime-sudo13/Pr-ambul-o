import { describe, expect, it } from 'vitest'
import {
  ageFrom,
  buildSynthesis,
  isAnswered,
  isUsable,
  isVisible,
  sessionToCsv,
  sessionToJson,
  synthesisToText,
  toIsoDate,
  visibleQuestions,
} from './engine'
import { TEMPLATES, exampleSessions } from './templates'
import type { Answers, Question, Session } from './types'

const q = (id: string, extra: Partial<Question> = {}): Question => ({
  id,
  section: 'Test',
  label: `Question ${id}`,
  type: 'text',
  required: false,
  ...extra,
})

const session = (questions: Question[], answers: Answers): Session => ({
  id: 's1',
  createdAt: '2026-11-14T10:00:00.000Z',
  consentAt: '2026-11-14T09:58:00.000Z',
  questions,
  answers,
})

describe('conditions d’affichage', () => {
  const pain = q('douleur', { type: 'yesno' })
  const where = q('ou', { condition: { questionId: 'douleur', op: 'is', value: 'Oui' } })
  const level = q('niveau', { type: 'scale', condition: { questionId: 'ou', op: 'isNot', value: '' } })
  const all = [pain, where, level]

  it('cache la question de suivi tant que la réponse ne correspond pas', () => {
    expect(isVisible(where, all, {})).toBe(false)
    expect(isVisible(where, all, { douleur: 'Non' })).toBe(false)
    expect(isVisible(where, all, { douleur: 'Oui' })).toBe(true)
  })

  it('cache toute la chaîne quand la première question est masquée', () => {
    expect(visibleQuestions(all, { douleur: 'Non', ou: 'Genou' }).map((x) => x.id)).toEqual(['douleur'])
  })

  it('gère les choix multiples et la condition « n’est pas »', () => {
    const signs = q('signes', { type: 'multi', options: ['Toux', 'Fièvre'] })
    const cough = q('toux', { condition: { questionId: 'signes', op: 'is', value: 'Toux' } })
    const noCough = q('sans', { condition: { questionId: 'signes', op: 'isNot', value: 'Toux' } })
    expect(isVisible(cough, [signs, cough], { signes: ['Fièvre', 'Toux'] })).toBe(true)
    expect(isVisible(noCough, [signs, noCough], { signes: ['Fièvre'] })).toBe(true)
    expect(isVisible(noCough, [signs, noCough], { signes: ['Toux'] })).toBe(false)
  })

  it('ne boucle pas sur des conditions circulaires', () => {
    const a = q('a', { condition: { questionId: 'b', op: 'is', value: 'x' } })
    const b = q('b', { condition: { questionId: 'a', op: 'is', value: 'x' } })
    expect(isVisible(a, [a, b], { a: 'x', b: 'x' })).toBe(false)
  })

  it('reste visible si la question dont elle dépend a été supprimée', () => {
    expect(isVisible(where, [where], {})).toBe(true)
  })
})

describe('réponses et questions utilisables', () => {
  it('considère vide un texte blanc ou une liste vide', () => {
    expect(isAnswered(undefined)).toBe(false)
    expect(isAnswered('   ')).toBe(false)
    expect(isAnswered([])).toBe(false)
    expect(isAnswered('Non')).toBe(true)
  })

  it('écarte une question sans texte ou un choix sans option', () => {
    expect(isUsable(q('a', { label: '  ' }))).toBe(false)
    expect(isUsable(q('a', { type: 'single', options: [] }))).toBe(false)
    expect(isUsable(q('a', { type: 'multi', options: ['Toux'] }))).toBe(true)
    expect(isUsable(q('a', { type: 'yesno' }))).toBe(true)
  })
})

describe('saisie de date', () => {
  const today = new Date(2026, 10, 14)

  it('accepte une date réelle et la met au format ISO', () => {
    expect(toIsoDate('8', '3', '1971', today)).toBe('1971-03-08')
    expect(toIsoDate('29', '02', '2024', today)).toBe('2024-02-29')
  })

  it('refuse une date incomplète, impossible, future ou trop ancienne', () => {
    expect(toIsoDate('', '3', '1971', today)).toBe('')
    expect(toIsoDate('8', '3', '71', today)).toBe('')
    expect(toIsoDate('31', '02', '2020', today)).toBe('')
    expect(toIsoDate('29', '02', '2023', today)).toBe('')
    expect(toIsoDate('15', '11', '2026', today)).toBe('')
    expect(toIsoDate('01', '01', '1850', today)).toBe('')
  })

  it('calcule l’âge à la date du questionnaire', () => {
    expect(ageFrom('1971-03-08', new Date(2026, 2, 7))).toBe(54)
    expect(ageFrom('1971-03-08', new Date(2026, 2, 8))).toBe(55)
    expect(ageFrom('pas une date', new Date())).toBeUndefined()
  })
})

describe('synthèse', () => {
  const [claire, julien] = exampleSessions()

  it('met l’identité en en-tête et la retire des rubriques', () => {
    const syn = buildSynthesis(claire)
    expect(syn.patientName).toBe('LAMBERT Claire')
    expect(syn.birthDate).toBe('08/03/1971')
    expect(syn.age).toBe(ageFrom('1971-03-08', new Date(claire.createdAt)))
    const labels = syn.sections.flatMap((s) => s.lines.map((l) => l.label))
    expect(labels).not.toContain('Nom')
    expect(labels).not.toContain('Date de naissance')
  })

  it('remplace un « Oui » par son détail quand le patient l’a précisé', () => {
    const lines = buildSynthesis(claire).sections.flatMap((s) => s.lines)
    expect(lines).toContainEqual({ label: 'Allergies', value: 'Pénicilline' })
    expect(lines).not.toContainEqual({ label: 'Allergies', value: 'Oui' })
    expect(lines).not.toContainEqual({ label: 'Douleur', value: 'Oui' })
    expect(lines).toContainEqual({ label: 'Intensité déclarée', value: '6/10' })
  })

  it('garde le « Oui » seul quand aucun détail n’a été donné', () => {
    const base = TEMPLATES[0].build().questions
    const syn = buildSynthesis(session(base, { nom: 'Test', douleur: 'Oui', fievre: 'Oui' }))
    const lines = syn.sections.flatMap((s) => s.lines)
    expect(lines).toContainEqual({ label: 'Fièvre', value: 'Oui' })
    expect(lines).toContainEqual({ label: 'Douleur', value: 'Oui' })
  })

  it('regroupe les réponses négatives par rubrique', () => {
    const syn = buildSynthesis(julien)
    const all = syn.sections.flatMap((s) => s.negatives)
    expect(all).toEqual(expect.arrayContaining(['Douleur', 'Médicaments en cours', 'Allergies', 'Opérations']))
  })

  it('ignore les réponses à des questions devenues invisibles', () => {
    const base = TEMPLATES[0].build().questions
    const syn = buildSynthesis(session(base, { nom: 'Test', douleur: 'Non', douleur_ou: 'Genou' }))
    expect(JSON.stringify(syn)).not.toContain('Genou')
  })

  it('ne contient aucun vocabulaire de diagnostic ou de recommandation', () => {
    const text = synthesisToText(claire).toLowerCase()
    for (const word of ['diagnostic', 'probable', 'suspicion', 'recommand', 'risque', 'score', 'urgent']) {
      expect(text).not.toContain(word)
    }
  })

  it('donne un nom par défaut quand l’identité n’est pas demandée', () => {
    expect(buildSynthesis(session([q('a')], { a: 'x' })).patientName).toBe('Patient sans nom')
  })
})

describe('exports', () => {
  const [claire] = exampleSessions()

  it('produit un JSON lisible avec les seules réponses données', () => {
    const data = JSON.parse(sessionToJson(claire))
    expect(data.reponses.find((r: { question: string }) => r.question.startsWith('Pourquoi')).reponse).toContain('genou')
    expect(data.reponses.some((r: { question: string }) => r.question.includes('température'))).toBe(false)
  })

  it('produit un CSV pour tableur français, accents compris', () => {
    const csv = sessionToCsv(claire)
    expect(csv.startsWith('﻿"Section";"Question";"Réponse"')).toBe(true)
    expect(csv).toContain('"Pénicilline"')
  })

  it('neutralise un texte qui serait lu comme une formule par le tableur', () => {
    const csv = sessionToCsv(session([q('a')], { a: '=HYPERLINK("http://x")' }))
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`)
  })
})

describe('modèles de questionnaire', () => {
  it.each(TEMPLATES.map((t) => [t.name, t.build().questions] as const))('%s est cohérent', (_name, questions) => {
    const ids = questions.map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
    questions.forEach((question, i) => {
      expect(isUsable(question)).toBe(true)
      if (question.condition) {
        const target = ids.indexOf(question.condition.questionId)
        expect(target).toBeGreaterThanOrEqual(0)
        expect(target).toBeLessThan(i)
      }
    })
    expect(questions.filter((x) => x.role).map((x) => x.role)).toEqual(['lastName', 'firstName', 'birthDate'])
  })
})
