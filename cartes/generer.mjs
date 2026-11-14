// Génère les cartes de visite à partir de brand.json :
//   cartes/carte-recto.svg, cartes/carte-verso.svg, cartes/cartes.html
// puis, si Edge ou Chrome est installé, cartes/cartes-impression.pdf
// Lancer avec : npm run cartes
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import QRCode from 'qrcode'

const here = dirname(fileURLToPath(import.meta.url))
const brand = JSON.parse(readFileSync(join(here, '..', 'brand.json'), 'utf8'))

// Format standard 85 × 55 mm, plus 3 mm de fond perdu de chaque côté.
const BLEED = 3
const W = 85 + 2 * BLEED
const H = 55 + 2 * BLEED
const TEAL = '#0f766e'
const DARK = '#0f172a'
const GREY = '#475569'
const FONT = "font-family=\"'Segoe UI', 'Helvetica Neue', Arial, sans-serif\""

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${body}</svg>`

const mark = (x, y, size, bg, fg) => {
  const k = size / 32
  return `<g transform="translate(${x} ${y}) scale(${k})"><rect width="32" height="32" rx="8" fill="${bg}"/><path d="M9 11h14M9 16h14M9 21h8" stroke="${fg}" stroke-width="2.6" stroke-linecap="round" fill="none"/></g>`
}

const left = BLEED + 7
const recto = svg(`
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect width="${BLEED + 2.5}" height="${H}" fill="${TEAL}"/>
  ${mark(left, BLEED + 7, 7, TEAL, '#ffffff')}
  <text x="${left + 9}" y="${BLEED + 12.6}" ${FONT} font-size="6.4" font-weight="700" fill="${TEAL}">${esc(brand.name)}</text>
  <text x="${left}" y="${BLEED + 21}" ${FONT} font-size="2.45" fill="${GREY}">Pré-consultation sur tablette pour les professionnels de santé</text>
  <text x="${left}" y="${BLEED + 34}" ${FONT} font-size="4.2" font-weight="700" fill="${DARK}">${esc(brand.founder)}</text>
  <text x="${left}" y="${BLEED + 38.6}" ${FONT} font-size="2.8" fill="${GREY}">${esc(brand.role)}</text>
  <text x="${left}" y="${BLEED + 45}" ${FONT} font-size="3" fill="${DARK}">${esc(brand.phone)}</text>
  <text x="${left}" y="${BLEED + 49.4}" ${FONT} font-size="3" fill="${DARK}">${esc(brand.email)}</text>
`)

// QR code dessiné en vectoriel, correction d'erreur moyenne.
const qr = QRCode.create(brand.siteUrl, { errorCorrectionLevel: 'M' })
const n = qr.modules.size
const QR = 27
const cell = QR / n
let path = ''
for (let r = 0; r < n; r++)
  for (let c = 0; c < n; c++)
    if (qr.modules.data[r * n + c]) path += `M${(c * cell).toFixed(3)} ${(r * cell).toFixed(3)}h${cell.toFixed(3)}v${cell.toFixed(3)}h-${cell.toFixed(3)}z`

const PAD = 2.5
const box = QR + 2 * PAD
const bx = (W - box) / 2
const by = BLEED + 4.5
const shortUrl = brand.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
const verso = svg(`
  <rect width="${W}" height="${H}" fill="${TEAL}"/>
  <rect x="${bx}" y="${by}" width="${box}" height="${box}" rx="2.5" fill="#ffffff"/>
  <path transform="translate(${bx + PAD} ${by + PAD})" d="${path}" fill="${DARK}"/>
  <text x="${W / 2}" y="${by + box + 7.2}" ${FONT} font-size="5" font-weight="700" fill="#ffffff" text-anchor="middle">Démonstration</text>
  <text x="${W / 2}" y="${by + box + 11.6}" ${FONT} font-size="2.6" fill="#ccfbf1" text-anchor="middle">2 minutes · ${esc(shortUrl)}</text>
`)

writeFileSync(join(here, 'carte-recto.svg'), recto)
writeFileSync(join(here, 'carte-verso.svg'), verso)

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Cartes de visite ${esc(brand.name)}</title>
<style>
  @page { size: ${W}mm ${H}mm; margin: 0; }
  html, body { margin: 0; }
  .face { width: ${W}mm; height: ${H}mm; page-break-after: always; overflow: hidden; }
  .face svg { display: block; }
  @media screen { body { background: #e2e8f0; padding: 24px; } .face { margin: 0 auto 24px; box-shadow: 0 4px 20px #0003; zoom: 2; } }
</style></head><body>
<div class="face">${recto}</div>
<div class="face">${verso}</div>
</body></html>`
const htmlPath = join(here, 'cartes.html')
writeFileSync(htmlPath, html)

const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
]
const browser = browsers.find(existsSync)
const pdfPath = join(here, 'cartes-impression.pdf')
if (browser) {
  execFileSync(
    browser,
    ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href],
    { stdio: 'ignore' },
  )
  console.log('PDF créé :', pdfPath)
} else {
  console.log('Aucun navigateur trouvé : ouvrez cartes.html et imprimez en PDF.')
}
console.log(`QR code → ${brand.siteUrl}`)
