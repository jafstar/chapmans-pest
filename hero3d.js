// Real 3D crest - not a disc with the logo printed on it, an actual
// cutout of the crest's own shape. logo-transparent.png already has a
// real alpha channel (from the luminance-key script), so a plane with
// alphaTest just renders the crest silhouette directly - no separate
// shape-extraction step needed. Mouse-tilt parallax delivers the "pop
// out of the screen" feel a flat plane can't get from lighting alone.
// Graceful degradation: the flat fallback img stays visible full-opacity
// until .hero-logo-3d-loaded fires, same contract as the earlier build.
import * as THREE from 'three'

const container = document.getElementById('heroLogo3d')
if (container) {
  try {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, container.clientWidth / container.clientHeight, 0.01, 100)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.insertBefore(renderer.domElement, container.querySelector('.hero-logo-gloss'))

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const key = new THREE.DirectionalLight(0xffffff, 2.0)
    key.position.set(2, 3, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x2f6fed, 1.6)
    rim.position.set(-3, -1, 2)
    scene.add(rim)

    const texLoader = new THREE.TextureLoader()
    texLoader.load('assets/img/logo-transparent.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      const imgW = texture.image.width
      const imgH = texture.image.height
      const planeH = 2
      const planeW = planeH * (imgW / imgH)

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(planeW, planeH, 2, 2),
        new THREE.MeshStandardMaterial({
          map: texture, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
          metalness: 0.35, roughness: 0.3,
        })
      )
      scene.add(mesh)

      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
      camera.position.z = (planeH / 2 / Math.sin(halfFov)) * 1.18

      container.classList.add('hero-logo-3d-loaded')

      const backing = container.querySelector('.hero-logo-backing')

      let t = 0
      let targetTiltX = 0
      let targetTiltY = 0
      let curTiltX = 0
      let curTiltY = 0

      container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        targetTiltY = nx * 0.5
        targetTiltX = -ny * 0.5
      })
      container.addEventListener('pointerleave', () => { targetTiltX = 0; targetTiltY = 0 })

      // Real bug, called out live: the old version also nudged mesh.position.z
      // each cycle, which reads as a perspective zoom pump (moving closer/
      // further from camera changes apparent size) rather than a clean
      // breathe. Scale-only now - no depth movement. The backing glow's
      // blur is driven by this exact same breathe value each frame, so it
      // pulses in genuine lockstep with the logo instead of running its
      // own separately-timed loop.
      function animate() {
        requestAnimationFrame(animate)
        curTiltX += (targetTiltX - curTiltX) * 0.08
        curTiltY += (targetTiltY - curTiltY) * 0.08
        mesh.rotation.x = curTiltX
        mesh.rotation.y = curTiltY
        if (!reducedMotion) {
          t += 0.016
          const breathe = Math.sin(t * 1.3)
          mesh.scale.setScalar(1 + breathe * 0.008)
          if (backing) backing.style.filter = `blur(${34 + breathe * 7}px)`
        }
        renderer.render(scene, camera)
      }
      animate()
    }, undefined, (err) => {
      console.warn('3D crest failed to load - keeping the flat image.', err)
    })

    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    })
  } catch (err) {
    console.warn('3D crest init failed - keeping the flat image.', err)
  }
}
