// Enregistre la vidéo de présentation en pilotant la vraie application.
// Lancer avec : npm run video (l'application est démarrée automatiquement si elle ne tourne pas déjà)
// Résultat : video/presentation.mp4 (1920 × 1080) et video/apercu.png
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'
import ffmpegPath from 'ffmpeg-static'
import { createServer } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))
const brand = JSON.parse(readFileSync(join(here, '..', 'brand.json'), 'utf8'))
const APP = process.env.APP_URL ?? 'http://localhost:5174/'
const shortUrl = brand.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
const appAddress = brand.appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
if (!chrome) throw new Error('Chrome ou Edge introuvable.')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const raw = join(here, 'brut.webm')
const out = join(here, 'presentation.mp4')

// Démarre l'application si elle ne tourne pas déjà.
let server = null
try {
  await fetch(APP)
} catch {
  server = await createServer({ configFile: join(here, '..', 'vite.app.config.ts'), logLevel: 'silent' })
  await server.listen()
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: ['--window-size=1920,1080', '--hide-scrollbars', '--force-device-scale-factor=1', '--lang=fr-FR'],
})

try {
  const page = await browser.newPage()
  await page.goto(pathToFileURL(join(here, 'scene.html')).href)
  await page.evaluate((n, a) => stage.init(n, a), brand.name, appAddress)

  // ---------- Préparation hors caméra ----------
  await page.evaluate((src) => (document.getElementById('app').src = src), APP)
  const frame = await (await page.$('#app')).contentFrame()
  const waitText = (t) => frame.waitForFunction((x) => document.body.innerText.includes(x), { timeout: 15000 }, t)
  await waitText(brand.name)
  await frame.evaluate(() => {
    localStorage.clear()
    location.hash = '#/medecin'
    location.reload()
  })
  await sleep(1500)
  await waitText('Choisissez votre questionnaire')

  const find = async (text, sel = 'button') => {
    const h = await frame.evaluateHandle(
      (t, s) => [...document.querySelectorAll(s)].find((e) => e.textContent.trim().startsWith(t)) ?? null,
      text,
      sel,
    )
    const el = h.asElement()
    if (!el) throw new Error(`Élément introuvable : « ${text} »`)
    return el
  }
  const pointAt = async (el) => {
    await el.evaluate((e) => e.scrollIntoView({ block: 'nearest' }))
    const p = await el.evaluate((e) => {
      const b = e.getBoundingClientRect()
      return { x: b.left + Math.min(b.width / 2, 260), y: b.top + b.height / 2 }
    })
    await page.evaluate((q) => stage.cursorTo(q.x, q.y), p)
    await sleep(470)
  }
  const tap = async (text, { sel = 'button', after = 470 } = {}) => {
    const el = typeof text === 'string' ? await find(text, sel) : text
    await pointAt(el)
    await page.evaluate(() => stage.tap())
    await sleep(160)
    await el.evaluate((e) => e.click())
    await sleep(after)
  }
  const type = async (text, delay = 30) => {
    const el = (await frame.evaluateHandle(() => document.querySelector('main textarea, main input:not([type=checkbox])'))).asElement()
    await pointAt(el)
    await el.focus()
    // Frappe au clavier : le texte suit le champ actif (utile pour la date, qui passe d'une case à l'autre).
    await page.keyboard.type(text, { delay })
    await sleep(350)
  }
  const caption = (t) => page.evaluate((x) => stage.caption(x), t)
  const card = (html, dark = false) => page.evaluate((h, d) => stage.card(h, d), html, dark)

  await (await find('Médecine générale')).evaluate((e) => e.click())
  await waitText('Mes questions')
  await frame.evaluate(() => {
    navigator.clipboard.writeText = async () => {}
    location.hash = '#/patient'
  })
  await waitText('Bienvenue')

  // ---------- Enregistrement ----------
  await card(`<div class="logo">${await page.evaluate(() => stage.LOGO)}${brand.name}</div><p>${brand.tagline}</p>`)
  await sleep(1200)
  const recorder = await page.screencast({ path: raw, format: 'webm', fps: 30, quality: 8, ffmpegPath })

  // 1. Cartons d'ouverture
  await sleep(3400)
  await card(
    '<h1 class="words"><span>Motif.</span><span>Traitements.</span><br><span>Allergies.</span><span>Antécédents.</span></h1><p>Les mêmes questions, à chaque consultation.</p>',
  )
  await sleep(4300)
  await card('<h1>Et si le patient y répondait<br>avant d’entrer ?</h1>')
  await sleep(3200)

  // 2. Le patient, sur la tablette
  await page.evaluate(() => stage.device('tablet', 'Salle d’attente'))
  await card(null)
  await sleep(900)
  await caption('En salle d’attente, le patient répond sur une tablette.')
  await sleep(1500)
  await tap(await frame.$('input[type=checkbox]'), { after: 450 })
  await tap('Commencer', { after: 800 })

  await type('Martin')
  await tap('Continuer')
  await type('Sophie')
  await tap('Continuer')
  await type('14051981', 110)
  await tap('Continuer')
  await tap('Une femme')

  await caption('Une question par écran, de gros boutons.')
  await type('Mal de dos depuis un déménagement')
  await tap('Continuer')
  await tap('Quelques jours')

  await caption('Il a mal ? On lui demande où. Sinon, on passe à la suite.')
  await tap('Oui', { after: 800 })
  await type('Bas du dos')
  await tap('Continuer')
  await tap('6', { after: 500 })
  await tap('Continuer')
  await tap('Non') // fièvre
  const more = caption('Traitements, allergies, antécédents : rien n’est oublié.')
  await tap('Oui') // médicaments
  await more
  await type('Ibuprofène 400 mg')
  await tap('Continuer')
  await tap('Oui') // allergies
  await type('Pénicilline')
  await tap('Continuer')
  await tap('Non') // maladie suivie
  await tap('Non') // opérations
  await tap('Non') // tabac
  await tap('Continuer', { after: 900 }) // autre information

  await caption('Il relit ses réponses, puis il envoie.')
  await sleep(1400)
  await frame.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await sleep(1900)
  const sent = caption('Deux à trois minutes, sans aide.')
  await tap('Envoyer', { after: 600 })
  await sent
  await sleep(3000)

  // 3. Le praticien, sur son ordinateur
  await caption('')
  await page.evaluate(() => stage.hideDevice())
  await sleep(800)
  await frame.evaluate(() => {
    location.hash = '#/medecin'
    window.scrollTo(0, 0)
  })
  await waitText('Patients en attente')
  await page.evaluate(() => stage.device('desktop', 'Cabinet'))
  await sleep(1000)
  await caption('Côté praticien, la synthèse est déjà là quand le patient entre.')
  await sleep(2600)
  await tap('MARTIN', { after: 900 })
  await caption('Motif, douleur, traitements, allergies : tout est classé.')
  await sleep(2200)
  await frame.evaluate(() => window.scrollTo({ top: 260, behavior: 'smooth' }))
  await sleep(2800)
  await frame.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await sleep(900)
  const copied = caption('Un clic pour la coller dans votre logiciel habituel.')
  await tap('Copier pour mon logiciel', { after: 400 })
  await copied
  await sleep(2600)

  // 4. Les questions du praticien
  await tap('Mes questions', { after: 900 })
  await caption('Les questions sont les vôtres.')
  await sleep(1600)
  await frame.evaluate(() => window.scrollTo({ top: 520, behavior: 'smooth' }))
  await sleep(2200)
  await frame.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await sleep(1600)
  await tap('+ Ajouter une question', { after: 700 })
  await frame.evaluate(() => document.activeElement?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  await sleep(900)
  const label = (await frame.evaluateHandle(() => document.activeElement)).asElement()
  await pointAt(label)
  const added = caption('Ajoutez, retirez, réordonnez. En quelques secondes.')
  await label.type('Avez-vous voyagé à l’étranger récemment ?', { delay: 36 })
  await added
  const select = (await frame.evaluateHandle(() => document.querySelector('select'))).asElement()
  await pointAt(select)
  await page.evaluate(() => stage.tap())
  await select.select('yesno')
  await sleep(3000)

  // 5. Cartons de fin
  await caption('')
  await card('<h1>Aucun diagnostic.<br>Aucune recommandation.</h1><p>L’outil met en forme ce que le patient déclare. La décision reste la vôtre.</p>', true)
  await page.evaluate(() => stage.hideDevice())
  await sleep(5000)
  await card(
    `<div class="logo">${await page.evaluate(() => stage.LOGO.replace('#0f766e', '#ffffff').replace('stroke="#fff"', 'stroke="#115e59"'))}${brand.name}</div><p>Essayez la démonstration, elle est libre et sans inscription.</p><div class="url">${shortUrl}</div>`,
    true,
  )
  await sleep(5200)

  await recorder.stop()
} finally {
  await browser.close()
  await server?.close()
}

// ---------- Encodage final ----------
execFileSync(
  ffmpegPath,
  ['-y', '-i', raw, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', '-an', out],
  { stdio: 'ignore' },
)
execFileSync(ffmpegPath, ['-y', '-ss', '4', '-i', out, '-frames:v', '1', join(here, 'apercu.png')], { stdio: 'ignore' })
rmSync(raw, { force: true })
console.log('Vidéo créée :', out)
