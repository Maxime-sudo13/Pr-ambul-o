import { useEffect, useState } from 'react'
import { PRODUCT_NAME } from '../config'
import { NO, YES, display, isAnswered, newId, visibleQuestions } from '../engine'
import type { Answer, Answers, Question, Questionnaire, Session } from '../types'

const RESET_SECONDS = 20

/**
 * Plein écran + écran toujours allumé pendant le mode patient.
 * Le vrai verrouillage (impossible de quitter l'application) se règle sur la tablette :
 * voir docs/tablette-kiosque.md.
 */
let wakeLock: { release: () => Promise<void> } | null = null
async function enterKiosk() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
  } catch {
    /* refusé par le navigateur : on continue sans plein écran */
  }
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }
    wakeLock = (await nav.wakeLock?.request('screen')) ?? null
  } catch {
    /* non disponible sur cet appareil */
  }
}
async function leaveKiosk() {
  try {
    await wakeLock?.release()
    wakeLock = null
    if (document.fullscreenElement) await document.exitFullscreen()
  } catch {
    /* rien à faire */
  }
}

const bigBtn =
  'w-full rounded-2xl border-2 px-6 py-5 text-left text-xl font-medium transition active:scale-[0.99]'
const idle = 'border-slate-200 bg-white hover:border-teal-600'
const picked = 'border-teal-700 bg-teal-700 text-white'
const primary =
  'rounded-2xl bg-teal-700 px-8 py-4 text-xl font-semibold text-white transition hover:bg-teal-800 disabled:opacity-40'

interface Props {
  questionnaire: Questionnaire
  exitCode: string
  onComplete: (session: Session) => void
}

export default function PatientFlow({ questionnaire, exitCode, onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'questions' | 'review' | 'done'>('welcome')
  /** Vrai quand le patient corrige une réponse depuis le récapitulatif. */
  const [editing, setEditing] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [typedCode, setTypedCode] = useState('')
  const [consent, setConsent] = useState(false)
  const [consentAt, setConsentAt] = useState('')
  const [answers, setAnswers] = useState<Answers>({})
  const [index, setIndex] = useState(0)
  const [error, setError] = useState('')

  const restart = () => {
    setStep('welcome')
    setConsent(false)
    setAnswers({})
    setIndex(0)
    setError('')
    setEditing(false)
  }

  const questions = questionnaire.questions
  const visible = visibleQuestions(questions, answers)
  const current: Question | undefined = visible[Math.min(index, visible.length - 1)]

  const finish = (final: Answers) => {
    const shown = visibleQuestions(questions, final)
    const kept: Answers = {}
    for (const q of shown) if (isAnswered(final[q.id])) kept[q.id] = final[q.id]
    onComplete({
      id: newId(),
      createdAt: new Date().toISOString(),
      consentAt,
      questions: JSON.parse(JSON.stringify(questions)),
      answers: kept,
    })
    setStep('done')
  }

  /** Passe à la question suivante en tenant compte des réponses à jour. */
  const next = (latest: Answers = answers) => {
    if (!current) return
    if (current.required && !isAnswered(latest[current.id])) {
      setError('Merci de répondre à cette question pour continuer.')
      return
    }
    setError('')
    const list = visibleQuestions(questions, latest)
    const pos = list.findIndex((q) => q.id === current.id)
    if (editing || pos >= list.length - 1) {
      setEditing(false)
      setStep('review')
    } else setIndex(pos + 1)
  }

  /** Envoi final : on revient d'abord sur une question obligatoire restée vide. */
  const send = () => {
    const missing = visible.findIndex((q) => q.required && !isAnswered(answers[q.id]))
    if (missing >= 0) {
      setIndex(missing)
      setEditing(true)
      setStep('questions')
      setError('Merci de répondre à cette question pour continuer.')
      return
    }
    finish(answers)
  }

  const tryExit = () => {
    if (typedCode === exitCode) {
      void leaveKiosk()
      window.location.hash = '#/medecin'
    } else setTypedCode('')
  }

  const set = (value: Answer, advance = false) => {
    if (!current) return
    const latest = { ...answers, [current.id]: value }
    setAnswers(latest)
    setError('')
    if (advance) next(latest)
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-semibold text-teal-800">{PRODUCT_NAME}</span>
        <button className="text-sm text-slate-400 hover:text-slate-600" onClick={() => setExitOpen(true)}>
          Réservé au cabinet
        </button>
      </header>

      {exitOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold">Quitter le mode patient</h2>
            <p className="mt-1 text-slate-600">Saisissez le code du cabinet.</p>
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Code du cabinet"
              className="mt-4 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-teal-700"
              value={typedCode}
              onChange={(e) => setTypedCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryExit()}
            />
            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-300 py-3 font-medium"
                onClick={() => {
                  setExitOpen(false)
                  setTypedCode('')
                }}
              >
                Annuler
              </button>
              <button className="flex-1 rounded-xl bg-teal-700 py-3 font-semibold text-white" onClick={tryExit}>
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-10">
        {step === 'welcome' && (
          <div className="my-auto">
            <h1 className="text-4xl font-bold tracking-tight">Bienvenue</h1>
            <p className="mt-4 text-xl text-slate-600">
              En attendant votre médecin, répondez à quelques questions. Il aura vos réponses sous les yeux dès le début
              de la consultation.
            </p>
            <ul className="mt-6 space-y-2 text-lg text-slate-600">
              <li>• Cela prend 2 à 3 minutes.</li>
              <li>• Vos réponses sont transmises uniquement à votre médecin.</li>
              <li>• Vous pouvez passer les questions non obligatoires.</li>
            </ul>
            <label className="mt-8 flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-lg">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 size-6 accent-teal-700"
              />
              <span>J’accepte que mes réponses soient enregistrées et transmises à mon médecin pour préparer ma consultation.</span>
            </label>
            <button
              className={`${primary} mt-8 w-full`}
              disabled={!consent}
              onClick={() => {
                void enterKiosk()
                setConsentAt(new Date().toISOString())
                setStep('questions')
              }}
            >
              Commencer
            </button>
          </div>
        )}

        {step === 'questions' && current && (
          <>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
              <div
                className="h-full rounded-full bg-teal-700 transition-all"
                style={{ width: `${Math.round(((index + 1) / visible.length) * 100)}%` }}
              />
            </div>
            <div className="my-auto py-8" key={current.id}>
              <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">{current.section}</p>
              <h1 className="mt-2 text-3xl leading-snug font-bold">{current.label}</h1>
              {!current.required && <p className="mt-1 text-slate-500">Facultatif</p>}
              <div className="mt-8">
                <Field question={current} value={answers[current.id]} set={set} onEnter={() => next()} />
              </div>
              {error && <p className="mt-4 text-lg font-medium text-red-700">{error}</p>}
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                className="rounded-2xl px-6 py-4 text-xl font-medium text-slate-600 hover:bg-slate-200 disabled:invisible"
                disabled={index === 0 || editing}
                onClick={() => {
                  setError('')
                  setIndex(Math.max(0, Math.min(index, visible.length - 1) - 1))
                }}
              >
                ← Retour
              </button>
              <button className={primary} onClick={() => next()}>
                {editing ? 'Valider' : 'Continuer'}
              </button>
            </div>
          </>
        )}

        {step === 'review' && (
          <div className="py-6">
            <h1 className="text-3xl font-bold">Vérifiez vos réponses</h1>
            <p className="mt-2 text-lg text-slate-600">Touchez une ligne pour la corriger, puis envoyez.</p>
            <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
              {visible.map((q, i) => {
                const a = answers[q.id]
                return (
                  <li key={q.id}>
                    <button
                      className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
                      onClick={() => {
                        setIndex(i)
                        setEditing(true)
                        setError('')
                        setStep('questions')
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block text-slate-500">{q.short?.trim() || q.label}</span>
                        <span className="block text-lg font-medium whitespace-pre-line">
                          {isAnswered(a) ? display(q, a!) : <span className="font-normal text-slate-400">Pas de réponse</span>}
                        </span>
                      </span>
                      <span className="shrink-0 pt-1 text-teal-700">Modifier</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <button className={`${primary} mt-8 w-full`} onClick={send}>
              Envoyer à mon médecin
            </button>
          </div>
        )}

        {step === 'done' && <Done onRestart={restart} />}
      </main>
    </div>
  )
}

function Done({ onRestart }: { onRestart: () => void }) {
  const [left, setLeft] = useState(RESET_SECONDS)
  useEffect(() => {
    if (left <= 0) {
      onRestart()
      return
    }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left, onRestart])

  return (
    <div className="my-auto text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-teal-700 text-4xl text-white">✓</div>
      <h1 className="mt-6 text-4xl font-bold">Merci, c’est terminé</h1>
      <p className="mt-4 text-xl text-slate-600">
        Vos réponses ont été transmises à votre médecin. Vous pouvez rendre la tablette à l’accueil.
      </p>
      <button className={`${primary} mt-10`} onClick={onRestart}>
        Patient suivant
      </button>
      <p className="mt-4 text-slate-400">Retour automatique à l’accueil dans {left} s</p>
    </div>
  )
}

interface FieldProps {
  question: Question
  value: Answer | undefined
  set: (value: Answer, advance?: boolean) => void
  onEnter: () => void
}

function Field({ question: q, value, set, onEnter }: FieldProps) {
  const text = typeof value === 'string' ? value : ''
  const input =
    'w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-xl outline-none focus:border-teal-700'

  switch (q.type) {
    case 'yesno':
    case 'single': {
      const options = q.type === 'yesno' ? [YES, NO] : (q.options ?? [])
      return (
        <div className={q.type === 'yesno' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
          {options.map((o) => (
            <button key={o} className={`${bigBtn} ${text === o ? picked : idle}`} onClick={() => set(o, true)}>
              {o}
            </button>
          ))}
        </div>
      )
    }
    case 'multi': {
      const list = Array.isArray(value) ? value : []
      return (
        <div className="space-y-3">
          <p className="text-slate-500">Plusieurs réponses possibles</p>
          {(q.options ?? []).map((o) => {
            const on = list.includes(o)
            return (
              <button
                key={o}
                aria-pressed={on}
                className={`${bigBtn} ${on ? picked : idle}`}
                onClick={() => set(on ? list.filter((x) => x !== o) : [...list, o])}
              >
                {on ? '✓ ' : ''}
                {o}
              </button>
            )
          })}
        </div>
      )
    }
    case 'scale':
      return (
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, i) => String(i)).map((n) => (
            <button
              key={n}
              className={`rounded-xl border-2 py-4 text-xl font-semibold ${text === n ? picked : idle}`}
              onClick={() => set(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )
    case 'longtext':
      return <textarea autoFocus rows={4} className={input} value={text} onChange={(e) => set(e.target.value)} />
    case 'date':
      return (
        <input
          type="date"
          className={input}
          value={text}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => set(e.target.value)}
        />
      )
    default:
      return (
        <input
          autoFocus
          type={q.type === 'number' ? 'number' : 'text'}
          inputMode={q.type === 'number' ? 'decimal' : undefined}
          autoComplete="off"
          className={input}
          value={text}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        />
      )
  }
}
