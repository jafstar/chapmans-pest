// The logo asset is a flat JPG with a genuine white background baked in
// (not a transparent PNG) - the first composite attempt showed exactly
// that as an ugly white box. Real luminance-threshold alpha key: near-
// white pixels go transparent, with a soft falloff band near the edge
// so the crest's own white highlights/chrome don't get eaten too.
import sharp from 'sharp'

const WHITE_FLOOR = 232  // below this luminance, fully opaque
const WHITE_CEIL = 248   // above this, fully transparent

const img = sharp('C:/DEV2/AI_BUILD_ZONE/chapmans-pest-control/assets/img/logo.jpg')
const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })

for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  const lum = (r + g + b) / 3
  if (lum <= WHITE_FLOOR) continue
  const t = Math.min(1, Math.max(0, (lum - WHITE_FLOOR) / (WHITE_CEIL - WHITE_FLOOR)))
  data[i + 3] = Math.round(255 * (1 - t))
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile('C:/DEV2/AI_BUILD_ZONE/chapmans-pest-control/assets/img/logo-transparent.png')

console.log('Saved logo-transparent.png')
