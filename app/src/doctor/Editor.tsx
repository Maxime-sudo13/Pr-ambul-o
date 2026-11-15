import { useState } from 'react'
import ConfirmButton from '../ConfirmButton'
import { choicesOf, isUsable, newId } from '../engine'
import { TYPE_LABELS, type Question, type QuestionType, type Questionnaire } from '../types'

interface Props {
  questionnaire: Questionnaire
  onChange: (q: Questionnaire) => void
  onReset: () => void
  onChangeModel: () => void
  exitCode: string
  onExitCode: (code: string) => void
}

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700'
const label = 'block text-xs font-semibold text-slate-600 mb-1'
const iconBtn = 'rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent'

export default function Editor({ questionnaire, onChange, onReset, onChangeModel, exitCode, onExitCode }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const questions = questionnaire.questions
  const sections = [...new Set(questions.map((q) => q.section))]

  const setQuestions = (next: Question[]) => onChange({ ...questionnaire, questions: next })
  const patch = (id: string, changes: Partial<Question>) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...changes } : q)))

  const move = (i: number, delta: number) => {
    const j = i + delta
    if (j < 0 || j >= questions.length) return
    const next = [...questions]
    ;[next[i], next[j]] = [next[j], next[i]]
    // Une condition ne peut dépendre que d'une question posée avant.
    setQuestions(
      next.map((q, pos) =>
        q.condition && next.findIndex((x) => x.id === q.condition!.questionId) >= pos ? { ...q, condition: undefined } : q,
      ),
    )
  }

  const remove = (id: string) =>
    setQuestions(
      questions.filter((q) => q.id !== id).map((q) => (q.condition?.questionId === id ? { ...q, condition: undefined } : q)),
    )

  const add = () => {
    const q: Question = {
      id: newId(),
      section: sections[sections.length - 1] ?? 'Questions',
      label: '',
      type: 'text',
      required: false,
    }
    setQuestions([...questions, q])
    setEditing(q.id)
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Mes questions</h1>
          <p className="mt-1 text-sm text-slate-600">
            {questions.length} questions. Les modifications sont enregistrées automatiquement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
            onClick={onChangeModel}
          >
            Changer de modèle
          </button>
          <ConfirmButton
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            label="Recommencer la démo"
            question="Tout effacer, questions et patients ?"
            onConfirm={onReset}
          />
        </div>
      </div>

      <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-[1fr_14rem]">
        <div>
          <label className={label}>Nom du questionnaire</label>
          <input className={field} value={questionnaire.title} onChange={(e) => onChange({ ...questionnaire, title: e.target.value })} />
        </div>
        <div>
          <label className={label}>Code pour quitter le mode patient</label>
          <input
            className={field}
            inputMode="numeric"
            value={exitCode}
            onChange={(e) => onExitCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          />
        </div>
      </div>

      <ol className="mt-6 space-y-2">
        {questions.map((q, i) => {
          const newSection = i === 0 || questions[i - 1].section !== q.section
          const dependsOn = q.condition && questions.find((x) => x.id === q.condition!.questionId)
          return (
            <li key={q.id}>
              {newSection && (
                <h2 className="mt-6 mb-2 text-xs font-bold tracking-wider text-teal-800 uppercase first:mt-0">{q.section}</h2>
              )}
              <div className={`rounded-xl border bg-white ${editing === q.id ? 'border-teal-600 shadow-sm' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex flex-col">
                    <button className={iconBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Monter">
                      ▲
                    </button>
                    <button className={iconBtn} disabled={i === questions.length - 1} onClick={() => move(i, 1)} aria-label="Descendre">
                      ▼
                    </button>
                  </div>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(editing === q.id ? null : q.id)}>
                    <p className={`truncate font-medium ${q.label ? '' : 'text-slate-400 italic'}`}>
                      {q.label || 'Nouvelle question'}
                      {q.required && <span className="text-red-600"> *</span>}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {TYPE_LABELS[q.type]}
                      {!isUsable(q) && editing !== q.id && <span className="font-semibold text-red-700"> · incomplète : ne sera pas posée</span>}
                      {dependsOn && ` · seulement si « ${dependsOn.short || dependsOn.label} » ${q.condition!.op === 'is' ? '=' : '≠'} ${q.condition!.value}`}
                    </p>
                  </button>
                  <button className={iconBtn} onClick={() => setEditing(editing === q.id ? null : q.id)}>
                    {editing === q.id ? 'Fermer' : 'Modifier'}
                  </button>
                  <button className={`${iconBtn} hover:text-red-700`} onClick={() => remove(q.id)} aria-label="Supprimer">
                    ✕
                  </button>
                </div>
                {editing === q.id && (
                  <QuestionForm q={q} earlier={questions.slice(0, i)} sections={sections} patch={(c) => patch(q.id, c)} />
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <button
        className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 py-3 font-medium text-slate-600 hover:border-teal-600 hover:text-teal-800"
        onClick={add}
      >
        + Ajouter une question
      </button>
    </>
  )
}

interface FormProps {
  q: Question
  earlier: Question[]
  sections: string[]
  patch: (changes: Partial<Question>) => void
}

function QuestionForm({ q, earlier, sections, patch }: FormProps) {
  const hasOptions = q.type === 'single' || q.type === 'multi'
  const sources = earlier.filter((x) => choicesOf(x).length > 0)
  const source = q.condition && sources.find((x) => x.id === q.condition!.questionId)

  return (
    <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label}>Question posée au patient</label>
        <input autoFocus className={field} value={q.label} onChange={(e) => patch({ label: e.target.value })} />
      </div>
      <div>
        <label className={label}>Libellé court dans la synthèse (facultatif)</label>
        <input className={field} value={q.short ?? ''} onChange={(e) => patch({ short: e.target.value })} />
      </div>
      <div>
        <label className={label}>Rubrique</label>
        <input className={field} list="sections" value={q.section} onChange={(e) => patch({ section: e.target.value })} />
        <datalist id="sections">
          {sections.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div>
        <label className={label}>Type de réponse</label>
        <select
          className={field}
          value={q.type}
          disabled={!!q.role}
          onChange={(e) => {
            const type = e.target.value as QuestionType
            const needs = type === 'single' || type === 'multi'
            patch({ type, options: needs ? (q.options?.length ? q.options : ['Choix 1', 'Choix 2']) : undefined })
          }}
        >
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        {q.role && <p className="mt-1 text-xs text-slate-500">Question d’identité : le type est fixe.</p>}
      </div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" className="size-4 accent-teal-700" checked={q.required} onChange={(e) => patch({ required: e.target.checked })} />
        Réponse obligatoire
      </label>

      {hasOptions && (
        <div className="sm:col-span-2">
          <label className={label}>Choix proposés (un par ligne)</label>
          <textarea
            className={field}
            rows={Math.max(3, (q.options?.length ?? 0) + 1)}
            value={(q.options ?? []).join('\n')}
            onChange={(e) => patch({ options: e.target.value.split('\n') })}
            onBlur={() => patch({ options: (q.options ?? []).map((o) => o.trim()).filter(Boolean) })}
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <label className={label}>Afficher cette question…</label>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <select
            className={field}
            value={q.condition?.questionId ?? ''}
            onChange={(e) => {
              const src = sources.find((x) => x.id === e.target.value)
              patch({ condition: src ? { questionId: src.id, op: 'is', value: choicesOf(src)[0] } : undefined })
            }}
          >
            <option value="">Toujours</option>
            {sources.map((x) => (
              <option key={x.id} value={x.id}>
                Seulement selon : {x.short || x.label}
              </option>
            ))}
          </select>
          {q.condition && source && (
            <>
              <select
                className={field}
                value={q.condition.op}
                onChange={(e) => patch({ condition: { ...q.condition!, op: e.target.value as 'is' | 'isNot' } })}
              >
                <option value="is">est</option>
                <option value="isNot">n’est pas</option>
              </select>
              <select
                className={field}
                value={q.condition.value}
                onChange={(e) => patch({ condition: { ...q.condition!, value: e.target.value } })}
              >
                {choicesOf(source).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        {sources.length === 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Une condition s’appuie sur une question à choix ou Oui / Non placée avant celle-ci.
          </p>
        )}
      </div>
    </div>
  )
}
