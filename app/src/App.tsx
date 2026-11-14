import { PRODUCT_NAME, SITE_URL, TAGLINE } from './config'
import { useAppState, useHashRoute } from './store'
import PatientFlow from './patient/PatientFlow'
import DoctorSpace from './doctor/DoctorSpace'
import type { Session } from './types'

export default function App() {
  const [state, setState] = useAppState()
  const route = useHashRoute()

  if (route.startsWith('patient') && state.questionnaire) {
    return (
      <PatientFlow
        questionnaire={state.questionnaire}
        exitCode={state.exitCode}
        onComplete={(session: Session) => setState((s) => ({ ...s, sessions: [session, ...s.sessions] }))}
      />
    )
  }
  if (route.startsWith('medecin') || route.startsWith('patient')) {
    return <DoctorSpace state={state} setState={setState} />
  }

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">Démonstration</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{PRODUCT_NAME}</h1>
      <p className="mt-3 text-lg text-slate-600">{TAGLINE}.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a href="#/medecin" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-600">
          <h2 className="text-xl font-semibold">Espace praticien</h2>
          <p className="mt-2 text-slate-600">Choisir ses questions, lire les synthèses, exporter.</p>
        </a>
        <a
          href={state.questionnaire ? '#/patient' : '#/medecin'}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-600"
        >
          <h2 className="text-xl font-semibold">Tablette patient</h2>
          <p className="mt-2 text-slate-600">
            {state.questionnaire
              ? 'Remplir le questionnaire comme en salle d’attente.'
              : 'Disponible dès que le praticien a choisi ses questions.'}
          </p>
        </a>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Version de démonstration : les patients sont fictifs et rien ne quitte cet appareil. L’outil recueille ce que
        le patient déclare et le met en forme. Il ne pose aucun diagnostic et ne suggère aucun traitement.
      </p>
      <p className="mt-4 text-sm">
        <a href={SITE_URL} className="text-slate-500 underline hover:text-teal-700">
          En savoir plus sur {PRODUCT_NAME}
        </a>
      </p>
    </main>
  )
}
