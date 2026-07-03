'use client'

import { useEffect, useRef, useState } from 'react'

const CARPET = '/images/carpet/carpet-red.jpg'
const IMG_ASPECT = 3000 / 2000 // downloaded carpet image ratio
const START = 0.015

/**
 * Real 3D carpet-roll intro (Three.js). The carpet is an actual mesh whose
 * bottom curls into a growing cylinder — driven by scroll — lifting away to
 * reveal the site. Transparent background reveals the page below the roll.
 * Fully responsive on mobile and desktop.
 */
export function CarpetPreloader({ onDone }: { onDone: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [uiProgress, setUiProgress] = useState(START)

  useEffect(() => {
    let raf = 0
    let disposed = false
    const target = { p: START }
    const current = { p: START }
    const done = { v: false }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const mount = mountRef.current
    let cleanupThree = () => {}

    ;(async () => {
      const THREE = await import('three')
      if (disposed || !mount) return

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'

      const scene = new THREE.Scene()
      const FOV = 40
      const CAM_D = 10
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
      camera.position.set(0, 0, CAM_D)

      const visH = 2 * CAM_D * Math.tan((FOV * Math.PI) / 360)

      const tex = new THREE.TextureLoader().load(CARPET, () => renderOnce())
      // Keep the image's own (already display-ready) values so it isn't darkened
      // by an extra colour-space conversion in the raw ShaderMaterial.
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()

      const uniforms: any = {
        uProgress: { value: START },
        uH: { value: visH },
        uRadiusBase: { value: visH * 0.02 },
        uRadiusGrow: { value: visH * 0.085 },
        uTex: { value: tex },
        uUvScale: { value: new THREE.Vector2(1, 1) },
        uUvOffset: { value: new THREE.Vector2(0, 0) },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        side: THREE.DoubleSide,
        transparent: true,
        vertexShader: `
          uniform float uProgress; uniform float uH; uniform float uRadiusBase; uniform float uRadiusGrow;
          varying vec2 vUv; varying float vTheta; varying float vRolled;
          void main() {
            vUv = uv;
            vec3 p = position;
            float yTop = uH * 0.5;
            float y0 = p.y + yTop;              // 0 at bottom .. uH at top
            float L = uProgress * uH;           // rolled length from the bottom
            float R = uRadiusBase + uRadiusGrow * uProgress; // roll radius grows as it coils
            if (y0 < L) {
              float d = L - y0;
              float theta = d / max(R, 0.0001);
              float lineY = L - yTop;           // roll line in centered coords
              p.y = lineY - R * sin(theta);
              p.z = R - R * cos(theta);
              vTheta = theta; vRolled = 1.0;
            } else {
              vRolled = 0.0; vTheta = 0.0;
            }
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTex; uniform vec2 uUvScale; uniform vec2 uUvOffset;
          varying vec2 vUv; varying float vTheta; varying float vRolled;
          void main() {
            vec2 uv = vUv * uUvScale + uUvOffset;
            vec3 col = texture2D(uTex, uv).rgb * 1.12; // slight richness boost
            float shade = 1.0;
            if (vRolled > 0.5) {
              // cylindrical shading: light from upper-front
              float s = cos(vTheta - 0.7);
              shade = 0.5 + 0.6 * clamp(s, -1.0, 1.0);
              shade *= 1.0 - 0.14 * clamp(vTheta / 6.2831, 0.0, 1.0); // deep-coil occlusion
              // soft contact shadow just under where it meets the flat carpet
              shade = clamp(shade, 0.28, 1.25);
            }
            gl_FragColor = vec4(col * shade, 1.0);
          }
        `,
      })

      let geo = new THREE.PlaneGeometry(1, 1, 1, 280)
      const mesh = new THREE.Mesh(geo, material)
      scene.add(mesh)

      const resize = () => {
        const w = window.innerWidth, h = window.innerHeight
        renderer.setSize(w, h, false)
        const aspect = w / h
        camera.aspect = aspect
        camera.updateProjectionMatrix()
        const planeH = visH
        const planeW = visH * aspect
        geo.dispose()
        geo = new THREE.PlaneGeometry(planeW, planeH, 1, 280)
        mesh.geometry = geo
        uniforms.uH.value = planeH
        uniforms.uRadiusBase.value = planeH * 0.02
        uniforms.uRadiusGrow.value = planeH * 0.085
        // cover-fit the texture (like background-size: cover)
        const planeAspect = planeW / planeH
        if (IMG_ASPECT > planeAspect) {
          const sx = planeAspect / IMG_ASPECT
          uniforms.uUvScale.value.set(sx, 1); uniforms.uUvOffset.value.set((1 - sx) / 2, 0)
        } else {
          const sy = IMG_ASPECT / planeAspect
          uniforms.uUvScale.value.set(1, sy); uniforms.uUvOffset.value.set(0, (1 - sy) / 2)
        }
      }
      resize()
      window.addEventListener('resize', resize)

      const renderOnce = () => renderer.render(scene, camera)

      const finish = () => {
        if (done.v) return
        done.v = true
        setClosing(true)
        document.body.style.overflow = prevOverflow
        window.setTimeout(onDone, 650)
      }

      const loop = () => {
        // faster catch-up once the visitor has committed to unrolling
        const speed = target.p >= 0.999 ? 0.2 : 0.12
        current.p += (target.p - current.p) * speed
        uniforms.uProgress.value = current.p
        setUiProgress(current.p)
        renderer.render(scene, camera)
        if (target.p >= 0.999 && current.p > 0.9 && !done.v) finish()
        if (!disposed) raf = requestAnimationFrame(loop)
      }
      loop()

      cleanupThree = () => {
        window.removeEventListener('resize', resize)
        geo.dispose(); material.dispose(); tex.dispose(); renderer.dispose()
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      // expose scroll driver
      ;(mount as any).__bump = (d: number) => { target.p = Math.min(1, Math.max(START, target.p + d)) }
    })()

    // --- scroll / touch / key drive ---
    const bump = (d: number) => { const m = mountRef.current as any; if (m?.__bump) m.__bump(d) }
    const onWheel = (e: WheelEvent) => { e.preventDefault(); bump(e.deltaY / 950) }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => { const y = e.touches[0].clientY; bump((touchY - y) / 520); touchY = y }
    const onKey = (e: KeyboardEvent) => { if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); bump(0.16) } }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      cleanupThree()
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[130] overflow-hidden transition-opacity duration-600"
      style={{ opacity: closing ? 0 : 1, pointerEvents: closing ? 'none' : 'auto', background: 'transparent' }}
      aria-label="Intro"
    >
      <div ref={mountRef} className="absolute inset-0" />

      {/* Logo — top-left only */}
      <img
        src="/images/logo/naturalife-logo.png"
        alt="Naturalife"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 h-8 sm:h-10 w-auto drop-shadow-lg pointer-events-none"
        style={{ filter: 'brightness(0) invert(1)', opacity: 1 - uiProgress * 1.4 }}
      />
      {/* Down chevron hint (no text) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-8 animate-bounce pointer-events-none"
        style={{ opacity: uiProgress > 0.6 ? 0 : 0.9, transition: 'opacity 0.3s' }}
      >
        <svg className="w-6 h-6 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
