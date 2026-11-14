import { useState, type FormEvent, type ReactNode } from 'react'
import { APP_URL, BRAND } from './config'

const cta = 'inline-block rounded-xl bg-teal-700 px-6 py-3 text-lg font-semibold text-white transition hover:bg-teal-800'
const ghost = 'inline-block rounded-xl border border-slate-300 bg-white px-6 py-3 text-lg font-semibold transition hover:border-teal-700'
const eyebrow = 'text-sm font-semibold tracking-wide text-teal-700 uppercase'
const h2 = 'mt-3 text-3xl font-bold tracking-tight sm:text-4xl'
const wrap = 'mx-auto max-w-5xl px-5'
const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700'

const nav = [
  ['fonctionnement', 'Fonctionnement'],
  ['pour-qui', 'Pour qui'],
  ['tarif', 'Tarif'],
  ['questions', 'Questions'],
  ['contact', 'Contact'],
] as const

/** Défilement doux sans toucher à l'adresse (elle sert déjà à passer du site à la démo). */
function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const steps = [
  {
    title: 'Vous choisissez vos questions',
    text: 'Partez d’un modèle, puis ajoutez, retirez ou réordonnez. Une question peut n’apparaître que si le patient a répondu oui à une autre.',
  },
  {
    title: 'Le patient répond en salle d’attente',
    text: 'Sur une tablette, une question par écran, avec de gros boutons. Il relit ses réponses, puis il envoie. Deux à trois minutes.',
  },
  {
    title: 'Vous lisez la synthèse',
    text: 'Motif, douleur, traitements, allergies, antécédents : tout est classé par rubrique quand le patient s’assoit.',
  },
]

const guarantees = [
  {
    title: 'Aucun diagnostic',
    text: 'L’outil met en forme ce que le patient déclare. Il ne propose ni piste, ni score, ni traitement. La décision reste la vôtre.',
  },
  {
    title: 'Vos questions, pas les nôtres',
    text: 'Chaque cabinet a ses habitudes. Vous décidez de ce qui est demandé, dans quel ordre et à qui.',
  },
  {
    title: 'Dans votre logiciel en un clic',
    text: 'Un bouton copie la synthèse pour la coller dans le dossier patient. Impression, PDF et export sont aussi disponibles.',
  },
]

const professions = [
  { name: 'Médecins généralistes', example: 'Motif, depuis quand, traitements en cours, allergies.' },
  { name: 'Médecins spécialistes', example: 'Qui vous adresse, examens déjà réalisés, antécédents liés à la spécialité.' },
  { name: 'Chirurgiens-dentistes', example: 'Dent concernée, douleur au chaud ou au froid, anticoagulants.' },
  { name: 'Kinésithérapeutes', example: 'Zone douloureuse, gestes devenus difficiles, activité sportive.' },
  { name: 'Sages-femmes', example: 'Terme, grossesses précédentes, questions à aborder.' },
  { name: 'Infirmiers et maisons de santé', example: 'Un questionnaire par praticien, sur la même tablette.' },
]

const faq: { q: string; a: ReactNode }[] = [
  {
    q: 'Est-ce un dispositif médical ?',
    a: `Non. ${BRAND.name} recueille des réponses et les présente par rubrique. Il n’interprète rien, ne calcule aucun score et ne suggère ni examen ni traitement.`,
  },
  {
    q: 'Et les patients qui ne sont pas à l’aise avec une tablette ?',
    a: 'Rien ne change pour eux : ils ne la prennent pas et vous posez vos questions comme aujourd’hui. L’écran est pensé pour être lu sans lunettes de près : une question à la fois, de gros boutons.',
  },
  {
    q: 'Est-ce compatible avec mon logiciel ?',
    a: 'Oui, quel qu’il soit : la synthèse se copie en un clic et se colle dans le dossier du patient. Elle peut aussi être imprimée ou exportée. Les connexions directes avec les logiciels métiers viendront ensuite.',
  },
  {
    q: 'Quel matériel faut-il ?',
    a: `Une tablette et le Wi-Fi du cabinet. ${BRAND.name} s’y installe comme une application, et la tablette est verrouillée dessus : le patient ne peut ni la quitter, ni aller sur Internet, ni toucher aux réglages. Pour l’essai, nous vous fournissons une tablette déjà configurée.`,
  },
  {
    q: 'Où vont les données des patients ?',
    a: 'La démonstration n’utilise que des patients fictifs et ne transmet rien : tout reste dans votre navigateur. La version destinée aux cabinets sera hébergée en France chez un hébergeur certifié pour les données de santé (HDS) avant toute utilisation avec de vrais patients.',
  },
  {
    q: 'Puis-je l’utiliser dès maintenant dans mon cabinet ?',
    a: 'Vous pouvez essayer la démonstration tout de suite. Pour une utilisation avec vos patients, nous ouvrons d’abord quelques cabinets pilotes : écrivez-nous pour en faire partie.',
  },
]

export default function Landing() {
  const [menu, setMenu] = useState(false)

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className={`${wrap} flex items-center justify-between py-3`}>
          <button className="flex items-center gap-2 text-xl font-bold text-teal-800" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Mark /> {BRAND.name}
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map(([id, label]) => (
              <button key={id} className="text-sm font-medium text-slate-600 hover:text-teal-800" onClick={() => goTo(id)}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={APP_URL} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white hover:bg-teal-800">
              <span className="sm:hidden">Démo</span>
              <span className="hidden sm:inline">Essayer la démo</span>
            </a>
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium md:hidden"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              Menu
            </button>
          </div>
        </div>
        {menu && (
          <nav className={`${wrap} flex flex-col border-t border-slate-200 py-2 md:hidden`}>
            {nav.map(([id, label]) => (
              <button
                key={id}
                className="py-2.5 text-left font-medium text-slate-700"
                onClick={() => {
                  setMenu(false)
                  goTo(id)
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <section className={`${wrap} grid items-center gap-10 pt-12 pb-16 md:grid-cols-2`}>
        <div>
          <p className={eyebrow}>Pour les médecins et tous les professionnels de santé</p>
          <h1 className="mt-3 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Les questions de routine sont posées avant la consultation.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            En salle d’attente, votre patient répond sur tablette au questionnaire que vous avez choisi. Quand il entre,
            ses réponses sont déjà sous vos yeux, classées et lisibles en quelques secondes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={APP_URL} className={cta}>
              Essayer la démo
            </a>
            <button className={ghost} onClick={() => goTo('contact')}>
              Être recontacté
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">Démo libre, sans inscription, avec des patients fictifs.</p>
        </div>
        <SynthesisPreview />
      </section>

      <section id="fonctionnement" className="scroll-mt-16 bg-slate-50 py-16">
        <div className={wrap}>
          <p className={eyebrow}>Fonctionnement</p>
          <h2 className={h2}>Trois étapes, aucune formation</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-teal-700 font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <TabletPreview />
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Pensé pour la salle d’attente</h3>
              <ul className="mt-4 space-y-3 text-lg text-slate-600">
                <li>• Une seule question à l’écran, en gros caractères.</li>
                <li>• Les questions inutiles sont sautées : pas de douleur, pas de question sur la douleur.</li>
                <li>• Le patient relit et corrige avant d’envoyer.</li>
                <li>• La tablette revient seule à l’accueil pour le patient suivant.</li>
                <li>• La tablette est verrouillée sur l’application : impossible d’en sortir ou d’aller sur Internet sans le code du cabinet.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={`${wrap} py-16`}>
        <p className={eyebrow}>Ce qui ne change pas</p>
        <h2 className={h2}>Vous restez seul maître de la consultation</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {guarantees.map((g) => (
            <div key={g.title} className="border-l-4 border-teal-700 pl-4">
              <h3 className="text-xl font-semibold">{g.title}</h3>
              <p className="mt-2 text-slate-600">{g.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pour-qui" className="scroll-mt-16 bg-slate-50 py-16">
        <div className={wrap}>
          <p className={eyebrow}>Pour qui</p>
          <h2 className={h2}>Un questionnaire par métier, écrit par vous</h2>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            La démonstration montre un cabinet médical. Les questions, elles, sont libres : chaque profession pose les
            siennes.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professions.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tarif" className="scroll-mt-16 bg-teal-800 py-16 text-white">
        <div className={`${wrap} grid items-center gap-8 md:grid-cols-2`}>
          <div>
            <p className="text-sm font-semibold tracking-wide text-teal-200 uppercase">Tarif</p>
            <p className="mt-3 text-5xl font-bold">
              {BRAND.priceMonthly} €<span className="text-xl font-medium text-teal-100"> HT par mois et par praticien</span>
            </p>
            <ul className="mt-5 space-y-2 text-teal-50">
              <li>✓ Questionnaires et patients illimités</li>
              <li>✓ Vos questions configurées avec vous à l’installation</li>
              <li>✓ Synthèse à copier, imprimer ou exporter</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white/10 p-6">
            <h3 className="text-xl font-semibold">Cabinets pilotes</h3>
            <p className="mt-2 text-teal-50">
              Nous cherchons quelques cabinets pour essayer {BRAND.name} en conditions réelles et nous dire ce qui
              manque. Nous fournissons une tablette d’essai, prête à l’emploi et verrouillée sur l’application, et
              l’outil est offert pendant la période de test.
            </p>
            <button className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-lg font-semibold text-teal-800 hover:bg-teal-50" onClick={() => goTo('contact')}>
              Proposer mon cabinet
            </button>
          </div>
        </div>
      </section>

      <section id="questions" className={`${wrap} scroll-mt-16 py-16`}>
        <p className={eyebrow}>Questions fréquentes</p>
        <h2 className={h2}>Ce qu’on nous demande le plus</h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {faq.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span className="text-2xl font-normal text-teal-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="scroll-mt-16 bg-slate-50 py-16">
        <div className={`${wrap} grid gap-10 md:grid-cols-2`}>
          <div>
            <p className={eyebrow}>Contact</p>
            <h2 className={h2}>Une question, ou envie d’essayer dans votre cabinet ?</h2>
            <p className="mt-4 text-lg text-slate-600">
              Écrivez ou appelez : je vous réponds personnellement et je peux vous apporter une tablette d’essai au
              cabinet.
            </p>
            <p className="mt-6 text-lg font-semibold">{BRAND.founder}</p>
            <p className="text-slate-600">
              {BRAND.role} de {BRAND.name}
            </p>
            <p className="mt-3">
              <a className="font-medium text-teal-800 underline" href={`mailto:${BRAND.email}`}>
                {BRAND.email}
              </a>
            </p>
            <p className="mt-1">
              <a className="font-medium text-teal-800 underline" href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>
                {BRAND.phone}
              </a>
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className={`${wrap} text-sm text-slate-500`}>
          <p>
            {BRAND.name} recueille et met en forme les informations déclarées par le patient. Ce n’est pas un dispositif
            médical : il ne pose aucun diagnostic et ne recommande aucun traitement.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} {BRAND.name}</span>
            <a className="underline hover:text-teal-800" href="#/mentions-legales">
              Mentions légales
            </a>
            <a className="underline hover:text-teal-800" href="#/confidentialite">
              Confidentialité
            </a>
            <a className="underline hover:text-teal-800" href={APP_URL}>
              Démonstration
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

/** Sans serveur pour l'instant : le formulaire prépare un e-mail dans la messagerie du visiteur. */
function ContactForm() {
  const [name, setName] = useState('')
  const [job, setJob] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const body = [`Nom : ${name}`, `Profession : ${job}`, `Ville : ${city}`, '', message].join('\n')
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(`Demande d’information ${BRAND.name}`)}&body=${encodeURIComponent(body)}`
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
          Votre nom
          <input required className={`${input} mt-1 font-normal`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Profession
          <input required className={`${input} mt-1 font-normal`} value={job} onChange={(e) => setJob(e.target.value)} placeholder="Médecin généraliste" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Ville
          <input className={`${input} mt-1 font-normal`} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
        </label>
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
          Votre message
          <textarea rows={4} className={`${input} mt-1 font-normal`} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
      </div>
      <button type="submit" className={`${cta} mt-5 w-full`}>
        Préparer mon e-mail
      </button>
      <p className="mt-3 text-sm text-slate-500">
        Le bouton ouvre votre messagerie avec le message déjà rédigé. Rien n’est enregistré sur ce site.
      </p>
    </form>
  )
}

export function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0f766e" />
      <path d="M9 11h14M9 16h14M9 21h8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function SynthesisPreview() {
  const rows = [
    ['Motif', 'Mal au genou droit depuis une chute dans l’escalier'],
    ['Depuis', 'Quelques jours'],
    ['Localisation', 'Genou droit, côté intérieur'],
    ['Intensité déclarée', '6/10'],
    ['Médicaments', 'Lévothyrox 75 µg, paracétamol 1 g'],
    ['Allergies', 'Pénicilline'],
    ['Répond non à', 'Fièvre'],
  ]
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <figcaption className="border-b border-slate-200 pb-3">
        <p className="text-xs font-semibold tracking-wide text-teal-700 uppercase">Ce que vous lisez</p>
        <p className="mt-1 text-xl font-bold">LAMBERT Claire</p>
        <p className="text-sm text-slate-500">55 ans · questionnaire rempli il y a 4 minutes</p>
      </figcaption>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-400">Patiente fictive. Informations déclarées, sans diagnostic.</p>
    </figure>
  )
}

function TabletPreview() {
  return (
    <figure className="mx-auto w-full max-w-md rounded-[2rem] border-8 border-slate-800 bg-slate-50 p-6 shadow-xl">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-2/5 rounded-full bg-teal-700" />
      </div>
      <p className="mt-6 text-xs font-semibold tracking-wide text-teal-700 uppercase">Motif de consultation</p>
      <p className="mt-1 text-2xl font-bold">Avez-vous mal quelque part ?</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-teal-700 bg-teal-700 px-4 py-4 text-lg font-medium text-white">Oui</div>
        <div className="rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-lg font-medium">Non</div>
      </div>
      <figcaption className="mt-6 text-center text-xs text-slate-400">Ce que voit le patient</figcaption>
    </figure>
  )
}
