// Real Meshy image-to-3D call (api.meshy.ai/openapi/v1/image-to-3d,
// confirmed via their own docs before writing this, not guessed) - takes
// the clean studio-background hero render and turns it into an actual
// textured GLB. The crest logo goes in as texture_image_url so the
// generated material detailing (the cross emblem, the silver/navy split)
// stays true to the real brand mark instead of the model inventing its
// own interpretation of "some kind of blue armor."
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dir, '..')
const envPath = path.join(ROOT, '.env')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1')
}

const apiKey = process.env.MESHY_API_KEY
if (!apiKey) {
  console.log('MESHY_API_KEY not set yet in chapmans-pest-control/.env — nothing to do.')
  process.exit(0)
}

const heroPath = path.join(ROOT, 'assets', 'img', 'hero-for-3d.png')
const logoPath = path.join(ROOT, 'assets', 'img', 'logo.jpg')
const outDir = path.join(ROOT, 'assets', '3d')
fs.mkdirSync(outDir, { recursive: true })

const heroDataUri = `data:image/png;base64,${fs.readFileSync(heroPath).toString('base64')}`
const logoDataUri = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`

console.log('Submitting to Meshy image-to-3D...')
const submitRes = await fetch('https://api.meshy.ai/openapi/v1/image-to-3d', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_url: heroDataUri,
    ai_model: 'latest',
    model_type: 'standard',
    topology: 'quad',
    should_texture: true,
    enable_pbr: true,
    hd_texture: true,
    texture_image_url: logoDataUri,
    texture_prompt: 'Tactical navy-blue and gunmetal-silver armor with a bold silver cross emblem on the chest, matching the reference crest logo\'s exact color palette and cross design. Glowing electric-blue accent lights at the joints and mask.',
    target_formats: ['glb'],
  }),
})
if (!submitRes.ok) throw new Error(`Meshy submit ${submitRes.status}: ${(await submitRes.text()).slice(0, 500)}`)
const { result: taskId } = await submitRes.json()
console.log('  Task id:', taskId)

const start = Date.now()
let final = null
while (Date.now() - start < 10 * 60 * 1000) {
  await new Promise((r) => setTimeout(r, 5000))
  const pollRes = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!pollRes.ok) throw new Error(`Meshy poll ${pollRes.status}: ${(await pollRes.text()).slice(0, 500)}`)
  const data = await pollRes.json()
  console.log(`  ...${data.status} (${data.progress ?? 0}%)`)
  if (data.status === 'SUCCEEDED') { final = data; break }
  if (data.status === 'FAILED' || data.status === 'CANCELED') {
    throw new Error(`Meshy task ${data.status}: ${JSON.stringify(data.task_error || '')}`)
  }
}
if (!final) throw new Error('Meshy generation timed out after 10 minutes')

const glbUrl = final.model_urls?.glb
if (!glbUrl) throw new Error('Meshy succeeded but no glb URL in model_urls')

console.log('Downloading raw GLB...')
const glbRes = await fetch(glbUrl)
const rawPath = path.join(outDir, 'hero-raw.glb')
fs.writeFileSync(rawPath, Buffer.from(await glbRes.arrayBuffer()))
console.log('Saved ->', rawPath, `(${(fs.statSync(rawPath).size / 1024 / 1024).toFixed(1)}MB)`)

if (final.thumbnail_url) {
  const thumbRes = await fetch(final.thumbnail_url)
  fs.writeFileSync(path.join(outDir, 'hero-thumbnail.png'), Buffer.from(await thumbRes.arrayBuffer()))
}

console.log('\nNext: npx @gltf-transform/cli optimize assets/3d/hero-raw.glb assets/3d/hero.glb --texture-compress webp --texture-size 1024 --simplify-ratio 0.05 --simplify-error 0.001')
