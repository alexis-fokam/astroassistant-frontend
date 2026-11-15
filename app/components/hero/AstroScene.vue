<script setup lang="ts">
import type * as T from 'three'

/**
 * Scène 3D de la page d'accueil : la planète Astro Assistant et son anneau, entourés des
 * quatre astronautes de l'équipage en orbite. Sur la poitrine de chacun, une lumière bat au
 * rythme de son cœur ; des impulsions de données partent des astronautes vers la planète
 * (la surveillance embarquée). Three.js n'est chargé que dans le navigateur.
 * Avec « réduire les animations », la scène est dessinée une seule fois, immobile.
 */
const container = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | undefined

// Couleurs de la marque (main.css) : une teinte par astronaute.
const CREW_TONES = [0x20d9e0, 0x46b6f6, 0x9b5cf2, 0xc9b3f9]
const HEART_NOMINAL = 0x00c875
const HEART_WARNING = 0xfdab3d

onMounted(async () => {
  const el = container.value
  if (!el) return
  const THREE = await import('three')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ------------------------------------------------------------ moteur de rendu et caméra
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
  camera.position.set(0, 1.2, 11)

  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x1a1040, 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(5, 6, 8)
  scene.add(sun)
  const glow = new THREE.PointLight(0x46b6f6, 30, 20)
  glow.position.set(0, 0, 3)
  scene.add(glow)

  // ------------------------------------------------------------ planète et anneau (logo)
  const gradient = (geometry: T.BufferGeometry, stops: [number, number][], axis: 'x' | 'y') => {
    const pos = geometry.attributes.position!
    const colors: number[] = []
    geometry.computeBoundingBox()
    const box = geometry.boundingBox!
    const min = box.min[axis]
    const span = box.max[axis] - min || 1
    const color = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const tt = 1 - ((axis === 'x' ? pos.getX(i) : pos.getY(i)) - min) / span
      let k = 0
      while (k < stops.length - 2 && tt > stops[k + 1]![0]) k++
      const [t0, c0] = stops[k]!
      const [t1, c1] = stops[k + 1]!
      color.set(c0).lerp(new THREE.Color(c1), Math.min(1, Math.max(0, (tt - t0) / (t1 - t0 || 1))))
      colors.push(color.r, color.g, color.b)
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  }

  const planetGeo = new THREE.SphereGeometry(1.9, 64, 64)
  gradient(
    planetGeo,
    [
      [0, 0x46b6f6],
      [0.5, 0x7ff5ee],
      [0.62, 0xc4a3f7],
      [1, 0xa35cf5],
    ],
    'y',
  )
  const planet = new THREE.Mesh(
    planetGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.1,
      emissive: 0x241450,
      emissiveIntensity: 0.35,
    }),
  )
  scene.add(planet)

  // Halo doux autour de la planète.
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.25, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x46b6f6, transparent: true, opacity: 0.08, side: THREE.BackSide }),
  )
  scene.add(halo)

  const ringGeo = new THREE.TorusGeometry(3.1, 0.07, 16, 160)
  gradient(
    ringGeo,
    [
      [0, 0x2ce5e8],
      [0.5, 0x2f8ef0],
      [1, 0xa35cf5],
    ],
    'x',
  )
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      emissive: 0x2f8ef0,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    }),
  )
  ring.rotation.set(Math.PI / 2.3, 0.35, 0)
  scene.add(ring)

  // ------------------------------------------------------------ étoiles
  const starCount = 1400
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const r = 30 + Math.random() * 60
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPos.set(
      [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)],
      i * 3,
    )
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xdfe9ff,
      size: 0.18,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    }),
  )
  scene.add(stars)

  // ------------------------------------------------------------ astronautes
  const suit = new THREE.MeshStandardMaterial({ color: 0xf1f4fa, roughness: 0.6, metalness: 0.05 })
  const darkSuit = new THREE.MeshStandardMaterial({ color: 0x9aa3b8, roughness: 0.7 })

  function makeAstronaut(tone: number) {
    const body = new THREE.Group()
    const add = (geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      body.add(mesh)
      return mesh
    }
    add(new THREE.CapsuleGeometry(0.34, 0.42, 8, 16), suit, 0, 0, 0) // torse
    add(new THREE.BoxGeometry(0.52, 0.62, 0.26), darkSuit, 0, 0.05, -0.3) // sac de survie
    add(new THREE.SphereGeometry(0.33, 32, 32), suit, 0, 0.62, 0) // casque
    const visor = add(
      new THREE.SphereGeometry(0.27, 32, 32, -Math.PI / 2.4, Math.PI / 1.2, Math.PI / 3.2, Math.PI / 2.6),
      new THREE.MeshStandardMaterial({
        color: 0x0f1b33,
        metalness: 0.9,
        roughness: 0.12,
        emissive: tone,
        emissiveIntensity: 0.25,
      }),
      0,
      0.62,
      0.08,
    )
    visor.rotation.y = Math.PI / 2
    // Bras et jambes, légèrement écartés comme en apesanteur.
    const limb = new THREE.CapsuleGeometry(0.11, 0.38, 6, 12)
    const armL = add(limb, suit, -0.45, 0.08, 0)
    armL.rotation.z = 0.7
    const armR = add(limb, suit, 0.45, 0.12, 0)
    armR.rotation.z = -1.0
    const legL = add(limb, suit, -0.17, -0.62, 0)
    legL.rotation.z = 0.18
    const legR = add(limb, suit, 0.17, -0.6, 0.05)
    legR.rotation.z = -0.3
    // Badge de couleur de l'astronaute et lumière cardiaque sur la poitrine.
    add(
      new THREE.BoxGeometry(0.16, 0.06, 0.02),
      new THREE.MeshBasicMaterial({ color: tone }),
      0.13,
      0.22,
      0.33,
    )
    const heart = add(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: HEART_NOMINAL }),
      -0.1,
      0.12,
      0.33,
    )
    const heartGlow = add(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshBasicMaterial({ color: HEART_NOMINAL, transparent: true, opacity: 0.3 }),
      -0.1,
      0.12,
      0.33,
    )
    body.scale.setScalar(0.85)
    return { body, heart, heartGlow, armL, armR }
  }

  // Orbites : rayon, inclinaison, vitesse et phase propres à chacun.
  const ORBITS = [
    { radius: 3.3, tilt: 0.35, speed: 0.11, phase: 0.2, bpm: 64 },
    { radius: 3.9, tilt: -0.25, speed: 0.085, phase: 2.0, bpm: 78, warning: true },
    { radius: 2.9, tilt: 0.6, speed: 0.13, phase: 3.6, bpm: 70 },
    { radius: 4.3, tilt: -0.5, speed: 0.07, phase: 5.0, bpm: 60 },
  ]
  const crew = ORBITS.map((orbit, i) => {
    const astronaut = makeAstronaut(CREW_TONES[i]!)
    if (orbit.warning) {
      ;(astronaut.heart.material as T.MeshBasicMaterial).color.set(HEART_WARNING)
      ;(astronaut.heartGlow.material as T.MeshBasicMaterial).color.set(HEART_WARNING)
    }
    scene.add(astronaut.body)
    return {
      ...astronaut,
      orbit,
      spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.3),
    }
  })

  // Impulsions de données : un point lumineux voyage de chaque astronaute vers la planète.
  const pulses = crew.map((_, i) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({ color: CREW_TONES[i], transparent: true, opacity: 0.9 }),
    )
    scene.add(mesh)
    return { mesh, offset: i * 0.27 }
  })

  // ------------------------------------------------------------ animation
  const pointer = { x: 0, y: 0 }
  const onPointer = (event: PointerEvent) => {
    const rect = el.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  }
  window.addEventListener('pointermove', onPointer)

  const position = new THREE.Vector3()
  function frame(time: number) {
    planet.rotation.y = time * 0.08
    ring.rotation.z = time * 0.05
    stars.rotation.y = time * 0.004
    halo.scale.setScalar(1 + Math.sin(time * 1.2) * 0.015)

    crew.forEach(({ body, heart, heartGlow, armL, armR, orbit, spin }) => {
      const angle = orbit.phase + time * orbit.speed
      body.position.set(
        Math.cos(angle) * orbit.radius,
        Math.sin(angle) * orbit.radius * Math.sin(orbit.tilt) + Math.sin(time * 0.7 + orbit.phase) * 0.15,
        Math.sin(angle) * orbit.radius * Math.cos(orbit.tilt) * 0.55,
      )
      body.rotation.set(spin.x * time + 0.3, spin.y * time, Math.sin(time * 0.4 + orbit.phase) * 0.4)
      armL.rotation.z = 0.7 + Math.sin(time * 0.9 + orbit.phase) * 0.15
      armR.rotation.z = -1.0 + Math.cos(time * 0.8 + orbit.phase) * 0.15
      // Battement : deux pics rapprochés (« boum-boum ») à chaque cycle cardiaque.
      const beat = (time * orbit.bpm) / 60
      const p = beat - Math.floor(beat)
      const pulse = Math.exp(-((p - 0.05) ** 2) / 0.002) + 0.6 * Math.exp(-((p - 0.22) ** 2) / 0.002)
      heart.scale.setScalar(1 + pulse * 0.5)
      heartGlow.scale.setScalar(1 + pulse * 1.4)
      ;(heartGlow.material as T.MeshBasicMaterial).opacity = 0.15 + pulse * 0.45
    })

    pulses.forEach(({ mesh, offset }, i) => {
      const k = (time * 0.35 + offset) % 1
      position.copy(crew[i]!.body.position).lerp(planet.position, k)
      mesh.position.copy(position)
      ;(mesh.material as T.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.95
    })

    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.03
    camera.position.y += (1.2 - pointer.y * 0.8 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = el!
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Sur un écran étroit, on recule pour garder toute l'orbite dans le cadre.
    camera.position.z = w / h < 1 ? 16.5 : 12.5
    camera.updateProjectionMatrix()
    if (reduceMotion) frame(6)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(el)
  resize()

  let raf = 0
  let visible = true
  const clock = new THREE.Clock()
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (visible && !document.hidden) frame(clock.getElapsedTime())
  }
  // On ne dessine que lorsque la scène est à l'écran (économie de batterie).
  const seen = new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? true))
  seen.observe(el)
  if (reduceMotion) frame(6)
  else loop()

  cleanup = () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    seen.disconnect()
    window.removeEventListener('pointermove', onPointer)
    scene.traverse((object) => {
      const mesh = object as T.Mesh
      mesh.geometry?.dispose()
      const material = mesh.material as T.Material | T.Material[] | undefined
      if (Array.isArray(material)) material.forEach((m) => m.dispose())
      else material?.dispose()
    })
    renderer.dispose()
    renderer.domElement.remove()
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div
    ref="container"
    class="size-full [&>canvas]:block [&>canvas]:size-full"
    role="img"
    aria-label="Animation 3D : quatre astronautes en orbite autour de la planète Astro Assistant, leur cœur surveillé en direct"
  />
</template>
