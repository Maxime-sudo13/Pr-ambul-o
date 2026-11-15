# Préambuléo

Pré-consultation sur tablette pour les professionnels de santé : le patient répond en salle d'attente aux questions choisies par le praticien, qui lit une synthèse factuelle au début de la consultation.

**Règle de conception non négociable :** l'outil recueille et met en forme ce que le patient déclare. Il ne pose aucun diagnostic, ne calcule aucun score et ne suggère aucun examen ni traitement. Toute fonction qui franchirait cette limite ferait de l'outil un dispositif médical.

## Deux projets distincts

| Dossier | Rôle | Adresse prévue | En local |
|---|---|---|---|
| `site/` | Site vitrine : présentation, tarif, contact, pages légales | preambuleo.fr | http://localhost:5173 |
| `app/` | Application : espace praticien et tablette patient | app.preambuleo.fr | http://localhost:5174 |

Le site ne contient aucune donnée et renvoie vers l'application pour la démonstration. L'application est installable sur tablette et fonctionne sans connexion.

## Lancer

```bash
npm install
```

```bash
npm run dev:site
```

```bash
npm run dev:app
```

`npm run build` produit `dist/site/` et `dist/app/`, à publier séparément.

## Vérifier

```bash
npm test
```

lance les tests du moteur (conditions d'affichage, synthèse, dates, exports, cohérence des modèles). Ils tournent aussi avant chaque publication.

## Refaire la vidéo de présentation

```bash
npm run video
```

pilote la vraie application dans un navigateur, l'enregistre et produit `video/presentation.mp4`. Copier ensuite ce fichier dans `site/public/` pour mettre à jour la vidéo du site.

## Changer la marque, le contact ou le prix

Tout est dans `brand.json`, lu par le site, l'application et les cartes de visite.

```bash
npm run cartes
```

régénère `cartes/cartes-impression.pdf` (85 × 55 mm, 3 mm de fond perdu) avec un QR code vers `siteUrl`.

## Organisation

| Chemin | Rôle |
|---|---|
| `app/src/engine.ts` | Conditions d'affichage, synthèse, exports |
| `app/src/templates.ts` | Modèles de questionnaires et patients fictifs |
| `app/src/patient/` | Parcours tablette (plein écran, sortie par code) |
| `app/src/doctor/` | Espace praticien et éditeur de questions |
| `app/src/store.ts` | Stockage (appareil uniquement dans la démo) |
| `app/public/` | Icônes, manifeste d'installation, fonctionnement hors connexion |
| `site/src/` | Pages du site vitrine |
| `app/src/engine.test.ts` | Tests automatiques du moteur |
| `cartes/` | Cartes de visite |
| `video/` | Scène et scénario de la vidéo de présentation |
| `commercial/` | Documents commerciaux, gardés hors du dépôt (non versionnés) |
| `docs/tablette-kiosque.md` | Verrouiller une tablette sur l'application |

## Ce qui manque avant de vrais patients

La démo garde tout sur l'appareil et ne doit servir qu'avec des données fictives.

1. Un serveur et une base de données chez un hébergeur certifié HDS, à la place de `app/src/store.ts`.
2. Comptes praticiens avec connexion sécurisée, et lien entre la tablette et le poste du praticien.
3. Chiffrement, journal des accès, durée de conservation et suppression des données.
4. Textes légaux relus par un juriste : information du patient, contrat de sous-traitance, analyse d'impact.
5. Si une synthèse rédigée par IA est ajoutée : modèle hébergé en Europe dans un cadre conforme santé, réponses envoyées sans l'identité du patient, et synthèse toujours limitée aux faits déclarés.
