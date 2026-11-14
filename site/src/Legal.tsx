import type { ReactNode } from 'react'
import { BRAND } from './config'
import { Mark } from './Landing'

// Brouillons à faire relire par un juriste et à compléter (éléments entre crochets)
// une fois la société créée et l'hébergeur du site choisi.

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <a href="#/" className="flex items-center gap-2 text-xl font-bold text-teal-800">
            <Mark /> {BRAND.name}
          </a>
          <a href="#/" className="text-sm font-medium text-slate-600 hover:text-teal-800">
            ← Retour au site
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-5 py-12 text-slate-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {children}
      </main>
    </div>
  )
}

export function Mentions() {
  return (
    <Page title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        {BRAND.name} est édité par {BRAND.founder}, [forme juridique et numéro SIREN à compléter], [adresse à
        compléter].
      </p>
      <p>
        Contact : {BRAND.email} · {BRAND.phone}
      </p>
      <p>Directeur de la publication : {BRAND.founder}.</p>
      <h2>Hébergement</h2>
      <p>[Nom, adresse et téléphone de l’hébergeur du site à compléter.]</p>
      <h2>Nature du service</h2>
      <p>
        {BRAND.name} recueille et met en forme des informations déclarées par les patients. Ce n’est pas un dispositif
        médical : il ne pose aucun diagnostic, ne calcule aucun score et ne recommande aucun examen ni traitement.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>Les textes, le logo et l’interface de ce site sont la propriété de leur éditeur. Toute reproduction demande son accord.</p>
    </Page>
  )
}

export function Confidentialite() {
  return (
    <Page title="Confidentialité">
      <h2>Ce site</h2>
      <p>
        Ce site ne dépose aucun cookie publicitaire ni outil de mesure d’audience. Le formulaire de contact n’enregistre
        rien : il prépare un e-mail dans votre propre messagerie, que vous choisissez ou non d’envoyer.
      </p>
      <h2>La démonstration</h2>
      <p>
        La démonstration fonctionne avec des patients fictifs. Ce que vous y saisissez reste dans votre navigateur et
        n’est transmis à aucun serveur. Vous pouvez tout effacer avec le bouton « Recommencer la démo ». N’y saisissez
        pas d’informations concernant de vrais patients.
      </p>
      <h2>Vos messages</h2>
      <p>
        Si vous nous écrivez, vos coordonnées servent uniquement à vous répondre. Elles ne sont ni revendues ni
        partagées. Vous pouvez demander leur suppression à {BRAND.email}.
      </p>
      <h2>Version destinée aux cabinets</h2>
      <p>
        Avant toute utilisation avec de vrais patients, une politique de confidentialité complète, un contrat de
        sous-traitance et un hébergement certifié pour les données de santé seront mis en place. Cette page sera mise à
        jour à ce moment.
      </p>
    </Page>
  )
}
