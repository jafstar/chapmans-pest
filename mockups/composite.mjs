// The council's recommendation, sketched as a real composite rather than
// re-coded into the live site: full crest at ~300px, centered, on clean
// negative space, headline/CTA stacked below rather than beside. Logo is
// the REAL asset (composited pixel-accurate via sharp), not regenerated,
// so this actually answers "does the real crest read well at this size"
// instead of testing an AI reinterpretation of it.
import sharp from 'sharp'
import fs from 'fs'

const CANVAS_W = 1440
const CANVAS_H = 900
const LOGO_W = 300

const svgOverlay = `
<svg width="${CANVAS_W}" height="${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .eyebrow { font-family: 'Arial', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; fill: #38BDF8; }
    .headline { font-family: 'Arial Black', 'Arial', sans-serif; font-size: 46px; font-weight: 900; fill: #F5F7FA; text-transform: uppercase; }
    .sub { font-family: 'Arial', sans-serif; font-size: 16px; fill: #8B97AC; }
    .btn-text { font-family: 'Arial', sans-serif; font-size: 15px; font-weight: 700; fill: #04070C; }
  </style>
  <text x="720" y="470" text-anchor="middle" class="eyebrow">LOCALLY OWNED &amp; OPERATED · 17 YEARS EXPERIENCE</text>
  <text x="720" y="525" text-anchor="middle" class="headline">Whatever's in your walls,</text>
  <text x="720" y="575" text-anchor="middle" class="headline" fill="#38BDF8">we're coming for it.</text>
  <text x="720" y="620" text-anchor="middle" class="sub">Ants, spiders, mice, bees, roaches, bedbugs — 17 years serving Daniels, WV.</text>
  <rect x="600" y="655" width="240" height="52" rx="7" fill="#38BDF8"/>
  <text x="720" y="688" text-anchor="middle" class="btn-text">GET A FREE QUOTE</text>
</svg>
`

const logo = await sharp('C:/DEV2/AI_BUILD_ZONE/chapmans-pest-control/assets/img/logo-transparent.png')
  .resize({ width: LOGO_W })
  .toBuffer()
const logoMeta = await sharp(logo).metadata()

await sharp('C:/DEV2/AI_BUILD_ZONE/chapmans-pest-control/mockups/hero-field.png')
  .resize(CANVAS_W, CANVAS_H)
  .composite([
    { input: logo, left: Math.round((CANVAS_W - LOGO_W) / 2), top: 130 },
    { input: Buffer.from(svgOverlay), left: 0, top: 0 },
  ])
  .png()
  .toFile('C:/DEV2/AI_BUILD_ZONE/chapmans-pest-control/mockups/sketch-a-300px.png')

console.log('Saved sketch-a-300px.png, logo actual height:', logoMeta.height)
