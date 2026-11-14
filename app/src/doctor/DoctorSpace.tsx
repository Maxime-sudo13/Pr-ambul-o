import { useState, type Dispatch, type SetStateAction } from 'react'
import { PRODUCT_NAME } from '../config'
import {
  buildSynthesis,
  download,
  formatDateTime,
  sessionToCsv,
  sessionToJson,
  synthesisToText,
} from '../engine'
import { TEMPLATES, exampleSessions } from '../templates'
import type { AppState, Session } from '../types'
import ConfirmButton from '../ConfirmButton'
import Editor from './Editor'

interface Props {
  state: AppState
  setState: Dispatch<SetStateAction<AppState>>
}

const btn = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100'
const btnPrimary = 'rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800'

export default function DoctorSpace({ state, setState }: Props) {
  const [tab, setTab] = useState<'patients' | 'questions'>('patients')
  const [openId, setOpenId] = useState<string | null>(null)
  /** Vrai quand le médecin revient choisir un autre modèle de départ. */
  const [choosing, setChoosing] = useState(false)

  if (!state.questionnaire || choosing) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold tracking-tight">
          {state.questionnaire ? 'Choisissez un autre modèle' : 'Bienvenue. Choisissez votre questionnaire de départ'}
        </h1>
        <p className="mt-2 text-slate-600">
          {state.questionnaire
            ? 'Vos questions actuelles seront remplacées par celles du modèle. Les synthèses déjà reçues sont conservées.'
            : 'Vous pourrez ensuite ajouter, modifier, supprimer et réordonner chaque question, ou changer de modèle.'}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-600"
              onClick={() => {
                setState((s) => ({
                  ...s,
                  questionnaire: t.build(),
                  sessions: s.sessions.length ? s.sessions : exampleSessions(),
                }))
                setChoosing(false)
                setTab('questions')
              }}
            >
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{t.description}</p>
            </button>
          ))}
        </div>
        {state.questionnaire && (
          <button className={`${btn} mt-6`} onClick={() => setChoosing(false)}>
            ← Garder mes questions actuelles
          </button>
        )}
      </Shell>
    )
  }

  const open = state.sessions.find((s) => s.id === openId)
  const unseen = state.sessions.filter((s) => !s.seenAt).length
  const openSession = (id: string) => {
    setOpenId(id)
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === id && !x.seenAt ? { ...x, seenAt: new Date().toISOString() } : x)),
    }))
  }

  return (
    <Shell
      nav={
        <>
          <nav className="flex gap-1">
            {(
              [
                ['patients', unseen ? `Patients · ${unseen} à lire` : 'Patients'],
                ['questions', 'Mes questions'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key)
                  setOpenId(null)
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  tab === key ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <a href="#/patient" className={btnPrimary}>
            Lancer le mode patient
          </a>
        </>
      }
    >
      {tab === 'questions' && (
        <Editor
          questionnaire={state.questionnaire}
          onChange={(questionnaire) => setState((s) => ({ ...s, questionnaire }))}
          exitCode={state.exitCode}
          onExitCode={(exitCode) => setState((s) => ({ ...s, exitCode }))}
          onChangeModel={() => setChoosing(true)}
          onReset={() => {
            setState((s) => ({ ...s, questionnaire: null, sessions: [] }))
            setTab('patients')
            setOpenId(null)
          }}
        />
      )}

      {tab === 'patients' && !open && (
        <>
          <h1 className="text-2xl font-bold tracking-tight">Patients en attente</h1>
          {state.sessions.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Aucun questionnaire rempli pour l’instant. Lancez le mode patient pour essayer.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {state.sessions.map((s) => {
                const syn = buildSynthesis(s)
                const motif = syn.sections.flatMap((x) => x.lines).find((l) => l.label === 'Motif')?.value
                return (
                  <li key={s.id}>
                    <button className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50" onClick={() => openSession(s.id)}>
                      <div className="min-w-0 flex-1">
                        <p className={s.seenAt ? 'font-medium text-slate-600' : 'font-bold'}>
                          {!s.seenAt && <span className="mr-2 inline-block size-2.5 rounded-full bg-teal-600 align-middle" aria-label="À lire" />}
                          {syn.patientName}
                          {syn.age !== undefined && <span className="font-normal text-slate-500"> · {syn.age} ans</span>}
                          {s.example && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">exemple</span>
                          )}
                        </p>
                        {motif && <p className="truncate text-sm text-slate-600">{motif}</p>}
                      </div>
                      <span className="shrink-0 text-sm text-slate-500">{formatDateTime(s.createdAt)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {tab === 'patients' && open && (
        <SessionView
          session={open}
          onBack={() => setOpenId(null)}
          onDelete={() => {
            setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== open.id) }))
            setOpenId(null)
          }}
        />
      )}
    </Shell>
  )
}

function Shell({ nav, children }: { nav?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <a href="#/" className="font-semibold text-teal-800">
            {PRODUCT_NAME} <span className="font-normal text-slate-400">· espace médecin</span>
          </a>
          {nav}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 print:p-0">{children}</main>
    </div>
  )
}

function SessionView({ session, onBack, onDelete }: { session: Session; onBack: () => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false)
  const syn = buildSynthesis(session)
  const file = syn.patientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button className={btn} onClick={onBack}>
          ← Tous les patients
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            className={btnPrimary}
            onClick={async () => {
              await navigator.clipboard.writeText(synthesisToText(session))
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            {copied ? 'Copié ✓' : 'Copier pour mon logiciel'}
          </button>
          <button className={btn} onClick={() => window.print()}>
            Imprimer / PDF
          </button>
          <button className={btn} onClick={() => download(`${file}.json`, sessionToJson(session), 'application/json')}>
            JSON
          </button>
          <button className={btn} onClick={() => download(`${file}.csv`, sessionToCsv(session), 'text/csv;charset=utf-8')}>
            CSV
          </button>
          <ConfirmButton className={`${btn} text-red-700`} label="Supprimer" question="Supprimer cette synthèse ?" onConfirm={onDelete} />
        </div>
      </div>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:mt-0 print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold">{syn.patientName}</h1>
          <p className="mt-1 text-slate-600">
            {[syn.birthDate && `Né(e) le ${syn.birthDate}`, syn.age !== undefined && `${syn.age} ans`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1 text-sm text-slate-500">Questionnaire rempli le {formatDateTime(session.createdAt)}</p>
        </header>

        {syn.sections.map((sec) => (
          <section key={sec.title} className="mt-5">
            <h2 className="text-xs font-bold tracking-wider text-teal-800 uppercase">{sec.title}</h2>
            <dl className="mt-2 space-y-2">
              {sec.lines.map((l, i) => (
                <div key={i} className="grid gap-x-4 sm:grid-cols-[14rem_1fr]">
                  <dt className="text-slate-500">{l.label}</dt>
                  <dd className="font-medium whitespace-pre-line">{l.value}</dd>
                </div>
              ))}
              {sec.negatives.length > 0 && (
                <div className="grid gap-x-4 sm:grid-cols-[14rem_1fr]">
                  <dt className="text-slate-500">Répond non à</dt>
                  <dd>{sec.negatives.join(' · ')}</dd>
                </div>
              )}
            </dl>
          </section>
        ))}

        <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Informations déclarées par le patient, non vérifiées. Ce document ne contient ni diagnostic ni
          recommandation.
        </p>
      </article>
    </>
  )
}
