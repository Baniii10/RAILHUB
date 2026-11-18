'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Camera, RotateCw, Lightbulb, Sparkles, Download, Check, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export const LOCOMOTIVES = [
  {
    id: 'cc206',
    code: 'CC 206',
    fullName: 'General Electric CM20EMP',
    nickname: 'Si Hidung Ganda (Double Cab)',
    type: 'Diesel Elektrik',
    year: '2012 - Sekarang',
    builder: 'GE Transportation (Erie, Pennsylvania, USA)',
    engine: 'GE 7FDL-8 (8 Silinder V-Twin Turbocharged)',
    power: '2.250 HP (1.680 kW)',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (2 Bogi, 6 Gandar Penggerak)',
    weight: '90 Ton',
    duty: 'Kereta Eksekutif Utama & Angkutan Barang Logistik Jawa',
    colorLivery: '#FFFFFF',
    stripeColor: '#FF6B00',
    blueStripe: '#1A428A',
    description:
      'Lokomotif paling modern dan tangguh andalan PT Kereta Api Indonesia saat ini. Memiliki keunikan berupa kabin ganda (double cabin) di kedua ujungnya sehingga masinis tidak perlu memutar lokomotif di pemutar rel (turntable).',
  },
  {
    id: 'cc201',
    code: 'CC 201',
    fullName: 'General Electric U18C',
    nickname: 'Si Hidung Miring Legendaris',
    type: 'Diesel Elektrik',
    year: '1977 - Sekarang',
    builder: 'GE Transportation (USA)',
    engine: 'GE 7FDL-8 (Turbocharged)',
    power: '1.950 HP (1.450 kW)',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (2 Bogi, 6 Gandar Penggerak)',
    weight: '84 Ton',
    duty: 'Kereta Penumpang Antarkota & Kereta Campuran',
    colorLivery: '#F3F4F6',
    stripeColor: '#EA580C',
    blueStripe: '#1E3A8A',
    description:
      'Lokomotif pekerja keras paling legendaris dalam sejarah perkeretaapian modern Indonesia. Telah berdinas lebih dari empat dekade menaklukkan jalur pegunungan dan lintas utara-selatan Pulau Jawa.',
  },
  {
    id: 'cc203',
    code: 'CC 203',
    fullName: 'General Electric U20C',
    nickname: 'Si Moncong Hiu Aerodinamis',
    type: 'Diesel Elektrik',
    year: '1995 - Sekarang',
    builder: 'GE Transportation / PT INKA (Perakitan Madiun)',
    engine: 'GE 7FDL-8 Turbocharged EFI',
    power: '2.150 HP (1.600 kW)',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (2 Bogi, 6 Gandar Penggerak)',
    weight: '84 Ton',
    duty: 'Kereta Cepat Eksekutif Argo Generasi Pertama',
    colorLivery: '#F8FAFC',
    stripeColor: '#F97316',
    blueStripe: '#0F2C59',
    description:
      'Diperkenalkan pertama kali bersamaan dengan peluncuran armada prestisius KA Argo Bromo Anggrek dan Argo Gede pada tahun 1995. Memiliki moncong aerodinamis miring yang ikonik dan modern karya General Electric bekerjasama dengan Goninan.',
  },
  {
    id: 'cc300',
    code: 'CC 300',
    fullName: 'INKA CC 300 Diesel Hidrolik',
    nickname: 'Karya Merah Putih Anak Bangsa',
    type: 'Diesel Hidrolik',
    year: '2012 - Sekarang',
    builder: 'PT INKA Madiun (Indonesia)',
    engine: 'Caterpillar 3512B HD TA',
    power: '2.200 HP (1.640 kW)',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (Bogi Buatan Madiun)',
    weight: '84 Ton',
    duty: 'Dinas Penyelamatan Banjir, Luar Biasa & Inspeksi',
    colorLivery: '#DC2626',
    stripeColor: '#FFFFFF',
    blueStripe: '#18181B',
    description:
      'Lokomotif diesel hidrolik pertama yang sepenuhnya dirancang dan diproduksi di Indonesia oleh insinyur PT INKA Madiun. Mampu menerjang genangan air setinggi 1 meter (anti-banjir) berkat sistem penggerak hidrolik kedap air.',
  },
]

export default function Locomotive3DViewer({ onPhotoCaptured }) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const trainGroupRef = useRef(null)
  const lightsRef = useRef([])

  const [activeLocoId, setActiveLocoId] = useState('cc206')
  const [autoRotate, setAutoRotate] = useState(true)
  const [headlightsOn, setHeadlightsOn] = useState(true)
  const [isSnapshotting, setIsSnapshotting] = useState(false)

  const activeLoco = LOCOMOTIVES.find((l) => l.id === activeLocoId) || LOCOMOTIVES[0]

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a1628)
    scene.fog = new THREE.FogExp2(0x0a1628, 0.02)
    sceneRef.current = scene

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(11, 4.5, 9.5)
    cameraRef.current = camera

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.replaceChildren(renderer.domElement)
    rendererRef.current = renderer

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.02 // Don't go below ground
    controls.minDistance = 5
    controls.maxDistance = 22
    controls.target.set(0, 1.2, 0)
    controlsRef.current = controls

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8)
    keyLight.position.set(12, 18, 10)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 40
    keyLight.shadow.camera.left = -10
    keyLight.shadow.camera.right = 10
    keyLight.shadow.camera.top = 10
    keyLight.shadow.camera.bottom = -10
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x70a5ff, 1.2)
    rimLight.position.set(-14, 10, -12)
    scene.add(rimLight)

    const groundBounce = new THREE.DirectionalLight(0x1a335a, 0.6)
    groundBounce.position.set(0, -5, 0)
    scene.add(groundBounce)

    // 6. Railway Track & Ground
    buildRailwayEnvironment(scene)

    // 7. Train Group
    const trainGroup = new THREE.Group()
    scene.add(trainGroup)
    trainGroupRef.current = trainGroup

    // 8. Animation Loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate
        controlsRef.current.autoRotateSpeed = 1.2
        controlsRef.current.update()
      }

      renderer.render(scene, camera)
    }
    animate()

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.clear()
    }
  }, [])

  // Update autoRotate on controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
    }
  }, [autoRotate])

  // Build Locomotive Mesh whenever activeLocoId changes
  useEffect(() => {
    const trainGroup = trainGroupRef.current
    const scene = sceneRef.current
    if (!trainGroup || !scene) return

    // Clear previous train meshes
    while (trainGroup.children.length > 0) {
      const obj = trainGroup.children[0]
      trainGroup.remove(obj)
      disposeMesh(obj)
    }

    // Build the specific locomotive
    lightsRef.current = []
    buildLocomotive(trainGroup, activeLocoId, headlightsOn, lightsRef)
  }, [activeLocoId, headlightsOn])

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(11, 4.5, 9.5)
    controlsRef.current.target.set(0, 1.2, 0)
    controlsRef.current.update()
    toast.success('Sudut pandang direset', { id: 'reset-cam', duration: 1500 })
  }

  // Capture 3D Snapshot
  const handleCaptureSnapshot = () => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    if (!renderer || !scene || !camera) return

    setIsSnapshotting(true)
    try {
      // Force render frame to guarantee drawing buffer is fresh
      renderer.render(scene, camera)
      const dataUrl = renderer.domElement.toDataURL('image/png')

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `RAILHUB-3D-${activeLoco.code.replace(/\s+/g, '-')}-Snapshot.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Foto 3D ${activeLoco.code} berhasil diunduh!`, {
        icon: '📸',
        duration: 3000,
      })

      if (onPhotoCaptured) {
        onPhotoCaptured({
          loco: activeLoco,
          imageUrl: dataUrl,
        })
      }
    } catch {
      toast.error('Gagal mengambil tangkapan layar 3D')
    } finally {
      setTimeout(() => setIsSnapshotting(false), 500)
    }
  }

  return (
    <div className="rh-loco-viewer-container" style={{ position: 'relative', width: '100%', borderRadius: 24, overflow: 'hidden', background: '#07162C', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 'clamp(380px, 58vh, 580px)',
          display: 'block',
          cursor: 'grab',
        }}
        onMouseDown={(e) => { e.currentTarget.style.cursor = 'grabbing' }}
        onMouseUp={(e) => { e.currentTarget.style.cursor = 'grab' }}
      />

      {/* Top Floating Controls Bar */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Locomotive Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            background: 'rgba(7, 22, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '0.35rem',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            pointerEvents: 'auto',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          {LOCOMOTIVES.map((loco) => {
            const isActive = loco.id === activeLocoId
            return (
              <button
                key={loco.id}
                type="button"
                onClick={() => setActiveLocoId(loco.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 10,
                  border: isActive ? '1px solid #F97316' : '1px solid transparent',
                  background: isActive ? '#F97316' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{loco.code}</span>
                {isActive && <Sparkles size={12} color="#FFFFFF" />}
              </button>
            )
          })}
        </div>

        {/* Action Tool Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            background: 'rgba(7, 22, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '0.35rem',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            pointerEvents: 'auto',
          }}
        >
          {/* Headlights Toggle */}
          <button
            type="button"
            onClick={() => setHeadlightsOn(!headlightsOn)}
            title={headlightsOn ? 'Matikan Lampu' : 'Nyalakan Lampu'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: headlightsOn ? '1px solid #FBBF24' : '1px solid rgba(255,255,255,0.1)',
              background: headlightsOn ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
              color: headlightsOn ? '#FBBF24' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
            }}
          >
            <Lightbulb size={18} />
          </button>

          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Jeda Putaran' : 'Putar 360°'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: autoRotate ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
              background: autoRotate ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: autoRotate ? '#38BDF8' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
            }}
          >
            <RotateCw size={18} />
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={handleResetCamera}
            title="Reset Sudut Pandang"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
            }}
          >
            <Camera size={18} />
          </button>

          {/* Capture Photo Snapshot */}
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            disabled={isSnapshotting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0 0.85rem',
              height: 36,
              borderRadius: 10,
              border: '1px solid #10B981',
              background: '#10B981',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: isSnapshotting ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isSnapshotting ? <Check size={14} /> : <Download size={14} />}
            <span>Ambil Foto 3D</span>
          </button>
        </div>
      </div>

      {/* Floating Instructions & Badge at bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          background: 'rgba(7, 22, 44, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '0.4rem 0.85rem',
          borderRadius: 999,
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.75rem',
          pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        👆 Geser untuk memutar • Scroll untuk zoom
      </div>

      {/* Bottom Technical Specs Panel */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(7,22,44,0.92) 0%, #07162C 100%)',
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>{activeLoco.code}</span>
            <span style={{ fontSize: '0.8rem', background: '#F97316', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: 6, fontWeight: 700 }}>
              {activeLoco.type}
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#38BDF8', fontWeight: 600, marginBottom: '0.35rem' }}>
            {activeLoco.fullName} ({activeLoco.nickname})
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: 540 }}>
            {activeLoco.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.65rem',
            background: 'rgba(255,255,255,0.04)',
            padding: '0.85rem',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Daya Mesin</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{activeLoco.power.split('(')[0]}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Kecepatan</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10B981' }}>{activeLoco.topSpeed}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Gandar</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{activeLoco.axle.split(' ')[0]}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Berat Kosong</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{activeLoco.weight}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Pabrikan</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FCD34D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeLoco.builder.split('(')[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   3D PROCEDURAL LOCOMOTIVE GENERATOR
   Creates detailed, recognizable 3D models for CC 206, 201, 203, 300
   ═══════════════════════════════════════════════════════════════ */

function buildRailwayEnvironment(scene) {
  // Ground
  const groundGeo = new THREE.PlaneGeometry(60, 40)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0c1e36,
    roughness: 0.9,
    metalness: 0.1,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.05
  ground.receiveShadow = true
  scene.add(ground)

  // Ballast Bed (Kerikil Rel)
  const ballastGeo = new THREE.BoxGeometry(32, 0.25, 4.2)
  const ballastMat = new THREE.MeshStandardMaterial({
    color: 0x3d434d,
    roughness: 0.95,
    metalness: 0.05,
  })
  const ballast = new THREE.Mesh(ballastGeo, ballastMat)
  ballast.position.set(0, 0.1, 0)
  ballast.receiveShadow = true
  scene.add(ballast)

  // Sleepers (Bantalan Rel Kayu / Beton)
  const sleeperGeo = new THREE.BoxGeometry(0.35, 0.16, 3.2)
  const sleeperMat = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    roughness: 0.85,
    metalness: 0.1,
  })

  for (let x = -15; x <= 15; x += 0.8) {
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat)
    sleeper.position.set(x, 0.28, 0)
    sleeper.receiveShadow = true
    scene.add(sleeper)
  }

  // Steel Rails (Rel Baja)
  const railGeo = new THREE.BoxGeometry(32, 0.15, 0.12)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.25,
  })

  // Left rail (Z = -0.85)
  const leftRail = new THREE.Mesh(railGeo, railMat)
  leftRail.position.set(0, 0.42, -0.85)
  leftRail.castShadow = true
  leftRail.receiveShadow = true
  scene.add(leftRail)

  // Right rail (Z = +0.85)
  const rightRail = new THREE.Mesh(railGeo, railMat)
  rightRail.position.set(0, 0.42, 0.85)
  rightRail.castShadow = true
  rightRail.receiveShadow = true
  scene.add(rightRail)
}

function buildLocomotive(group, type, headlightsOn, lightsRef) {
  // Shared Materials
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f242e, metalness: 0.6, roughness: 0.4 })
  const steelWheelMat = new THREE.MeshStandardMaterial({ color: 0x5a6270, metalness: 0.9, roughness: 0.25 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x1e3a5f, metalness: 0.1, roughness: 0.1, transmission: 0.7, opacity: 0.9, transparent: true })
  const grillMat = new THREE.MeshStandardMaterial({ color: 0x181a20, metalness: 0.8, roughness: 0.6 })
  const headlightMat = new THREE.MeshStandardMaterial({
    color: headlightsOn ? 0xfff3d1 : 0x475569,
    emissive: headlightsOn ? 0xffea9f : 0x000000,
    emissiveIntensity: headlightsOn ? 2.8 : 0,
    roughness: 0.2,
  })

  // 1. Chassis / Frame Base
  const chassisLength = 11.2
  const chassisWidth = 2.45
  const chassisHeight = 0.45
  const chassisY = 1.05

  const chassisGeo = new THREE.BoxGeometry(chassisLength, chassisHeight, chassisWidth)
  const chassis = new THREE.Mesh(chassisGeo, chassisMat)
  chassis.position.set(0, chassisY, 0)
  chassis.castShadow = true
  chassis.receiveShadow = true
  group.add(chassis)

  // Underframe Fuel Tank (Tangki Solar Tengah)
  const fuelTankGeo = new THREE.CylinderGeometry(0.65, 0.65, 3.8, 16)
  const fuelTank = new THREE.Mesh(fuelTankGeo, chassisMat)
  fuelTank.rotation.z = Math.PI / 2
  fuelTank.position.set(0, chassisY - 0.42, 0)
  fuelTank.castShadow = true
  group.add(fuelTank)

  // 2. Bogies & Wheels (Co-Co: 2 Bogies x 3 Axles = 6 Axles)
  buildBogie(group, -3.4, chassisY - 0.45, steelWheelMat, chassisMat)
  buildBogie(group, 3.4, chassisY - 0.45, steelWheelMat, chassisMat)

  // 3. Couplers & Cowcatcher (Penghalau Rintangan)
  buildCouplerAndPilot(group, chassisLength / 2 + 0.15, chassisY - 0.2, 1)
  buildCouplerAndPilot(group, -chassisLength / 2 - 0.15, chassisY - 0.2, -1)

  // 4. Carbody based on Locomotive Series
  if (type === 'cc206') {
    // CC 206: Double Cab (Kabin Ganda Depan & Belakang Simetris)
    buildCC206Body(group, chassisY + chassisHeight / 2, glassMat, grillMat, headlightMat, headlightsOn, lightsRef)
  } else if (type === 'cc201') {
    // CC 201: Hidung Miring Pendek di Depan, Kabin, Long Hood di Belakang
    buildCC201Body(group, chassisY + chassisHeight / 2, glassMat, grillMat, headlightMat, headlightsOn, lightsRef)
  } else if (type === 'cc203') {
    // CC 203: Aerodinamis Hidung Miring Panjang di Depan
    buildCC203Body(group, chassisY + chassisHeight / 2, glassMat, grillMat, headlightMat, headlightsOn, lightsRef)
  } else if (type === 'cc300') {
    // CC 300: INKA Merah Putih Diesel Hidrolik Modern
    buildCC300Body(group, chassisY + chassisHeight / 2, glassMat, grillMat, headlightMat, headlightsOn, lightsRef)
  }
}

// ── Bogie Builder ──
function buildBogie(group, xPos, yPos, wheelMat, frameMat) {
  const bogie = new THREE.Group()
  bogie.position.set(xPos, yPos, 0)

  // Bogie side frame
  const frameGeo = new THREE.BoxGeometry(3.2, 0.25, 2.2)
  const frame = new THREE.Mesh(frameGeo, frameMat)
  frame.castShadow = true
  bogie.add(frame)

  // 3 Axles (6 Wheels)
  const wheelRadius = 0.42
  const wheelWidth = 0.15
  const axleOffsets = [-1.15, 0, 1.15]

  axleOffsets.forEach((ox) => {
    // Axle rod
    const axleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.9, 12)
    const axle = new THREE.Mesh(axleGeo, wheelMat)
    axle.rotation.x = Math.PI / 2
    axle.position.set(ox, -0.1, 0)
    bogie.add(axle)

    // Left Wheel (Z = -0.85)
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24)
    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat)
    leftWheel.rotation.x = Math.PI / 2
    leftWheel.position.set(ox, -0.1, -0.85)
    leftWheel.castShadow = true
    bogie.add(leftWheel)

    // Right Wheel (Z = +0.85)
    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat)
    rightWheel.rotation.x = Math.PI / 2
    rightWheel.position.set(ox, -0.1, 0.85)
    rightWheel.castShadow = true
    bogie.add(rightWheel)
  })

  group.add(bogie)
}

// ── Coupler & Cowcatcher ──
function buildCouplerAndPilot(group, xPos, yPos, direction) {
  const pilotMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.4, roughness: 0.5 }) // Orange cowcatcher
  const couplerMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 })

  // Cowcatcher wedge
  const cowcatcherGeo = new THREE.BoxGeometry(0.35, 0.45, 2.3)
  const cowcatcher = new THREE.Mesh(cowcatcherGeo, pilotMat)
  cowcatcher.position.set(xPos, yPos - 0.1, 0)
  cowcatcher.castShadow = true
  group.add(cowcatcher)

  // Coupler (Penghubung Gerbong Janney AAR)
  const couplerGeo = new THREE.BoxGeometry(0.5, 0.2, 0.25)
  const coupler = new THREE.Mesh(couplerGeo, couplerMat)
  coupler.position.set(xPos + direction * 0.3, yPos + 0.05, 0)
  coupler.castShadow = true
  group.add(coupler)
}

/* ═══════════════════════════════════════════════════════════════
   1. CC 206 (GE CM20EMP) - Double Cab Modern
   ═══════════════════════════════════════════════════════════════ */
function buildCC206Body(group, baseY, glassMat, grillMat, headlightMat, headlightsOn, lightsRef) {
  const whiteBodyMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.2, roughness: 0.3 })
  const orangeStripeMat = new THREE.MeshStandardMaterial({ color: 0xff6b00, metalness: 0.3, roughness: 0.4 })
  const blueStripeMat = new THREE.MeshStandardMaterial({ color: 0x1a428a, metalness: 0.4, roughness: 0.3 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 })

  const bodyLength = 10.4
  const bodyWidth = 2.4
  const bodyHeight = 2.1
  const bodyCenterY = baseY + bodyHeight / 2

  // Main Hood Body
  const bodyGeo = new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth)
  const body = new THREE.Mesh(bodyGeo, whiteBodyMat)
  body.position.set(0, bodyCenterY, 0)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  // Curved Roof
  const roofGeo = new THREE.CylinderGeometry(1.22, 1.22, bodyLength, 16, 1, false, 0, Math.PI)
  const roof = new THREE.Mesh(roofGeo, roofMat)
  roof.rotation.z = Math.PI / 2
  roof.rotation.y = Math.PI / 2
  roof.position.set(0, baseY + bodyHeight, 0)
  roof.castShadow = true
  group.add(roof)

  // Livery Stripes (Orange & Blue)
  const stripeOrangeGeo = new THREE.BoxGeometry(bodyLength + 0.02, 0.22, bodyWidth + 0.02)
  const stripeOrange = new THREE.Mesh(stripeOrangeGeo, orangeStripeMat)
  stripeOrange.position.set(0, baseY + 0.5, 0)
  group.add(stripeOrange)

  const stripeBlueGeo = new THREE.BoxGeometry(bodyLength + 0.02, 0.16, bodyWidth + 0.02)
  const stripeBlue = new THREE.Mesh(stripeBlueGeo, blueStripeMat)
  stripeBlue.position.set(0, baseY + 0.72, 0)
  group.add(stripeBlue)

  // Cab Windows (Front & Back - Double Cab!)
  const cabEnds = [-bodyLength / 2, bodyLength / 2]
  cabEnds.forEach((xEnd, idx) => {
    const dir = xEnd > 0 ? 1 : -1

    // Windshield 1 & 2
    const winGeo = new THREE.BoxGeometry(0.08, 0.55, 0.75)
    const winLeft = new THREE.Mesh(winGeo, glassMat)
    winLeft.position.set(xEnd + dir * 0.02, bodyCenterY + 0.45, -0.48)
    group.add(winLeft)

    const winRight = new THREE.Mesh(winGeo, glassMat)
    winRight.position.set(xEnd + dir * 0.02, bodyCenterY + 0.45, 0.48)
    group.add(winRight)

    // Headlight Assembly
    const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16)
    const hl = new THREE.Mesh(hlGeo, headlightMat)
    hl.rotation.z = Math.PI / 2
    hl.position.set(xEnd + dir * 0.05, bodyCenterY + 0.9, 0)
    group.add(hl)

    // Spotlight beam when on
    if (headlightsOn && dir > 0) {
      const spot = new THREE.SpotLight(0xfff5d1, 3.5, 20, Math.PI / 6, 0.4, 1)
      spot.position.set(xEnd + 0.2, bodyCenterY + 0.9, 0)
      spot.target.position.set(xEnd + 10, 0, 0)
      group.add(spot)
      group.add(spot.target)
      lightsRef.current.push(spot)
    }
  })

  // Roof AC Units & Dynamic Exhaust Fans
  const acGeo = new THREE.BoxGeometry(1.6, 0.35, 1.4)
  const ac1 = new THREE.Mesh(acGeo, roofMat)
  ac1.position.set(-1.8, baseY + bodyHeight + 0.15, 0)
  group.add(ac1)

  const ac2 = new THREE.Mesh(acGeo, roofMat)
  ac2.position.set(1.8, baseY + bodyHeight + 0.15, 0)
  group.add(ac2)

  // Radiator Fan Grill Center
  const grillGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16)
  const fanGrill = new THREE.Mesh(grillGeo, grillMat)
  fanGrill.position.set(0, baseY + bodyHeight + 0.08, 0)
  group.add(fanGrill)
}

/* ═══════════════════════════════════════════════════════════════
   2. CC 201 (GE U18C) - Hidung Miring Pendek Legendaris
   ═══════════════════════════════════════════════════════════════ */
function buildCC201Body(group, baseY, glassMat, grillMat, headlightMat, headlightsOn, lightsRef) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.2, roughness: 0.4 })
  const orangeStripeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.3, roughness: 0.4 })
  const blueStripeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.4, roughness: 0.3 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.5 })

  // Short Slanted Hood (Front: X = +1.8 to +4.8)
  const shortHoodGeo = new THREE.BoxGeometry(2.8, 1.45, 2.1)
  const shortHood = new THREE.Mesh(shortHoodGeo, bodyMat)
  shortHood.position.set(3.4, baseY + 1.45 / 2, 0)
  shortHood.castShadow = true
  group.add(shortHood)

  // Slanted Nose Slope
  const slopeGeo = new THREE.BoxGeometry(0.8, 0.6, 2.08)
  const slope = new THREE.Mesh(slopeGeo, bodyMat)
  slope.rotation.z = -Math.PI / 4
  slope.position.set(4.6, baseY + 1.2, 0)
  group.add(slope)

  // High Driver Cab (Tengah-Depan: X = +0.5 to +2.0)
  const cabGeo = new THREE.BoxGeometry(1.6, 2.25, 2.38)
  const cab = new THREE.Mesh(cabGeo, bodyMat)
  cab.position.set(1.2, baseY + 2.25 / 2, 0)
  cab.castShadow = true
  group.add(cab)

  // Long Engine Hood (Rear: X = -4.8 to +0.4)
  const longHoodGeo = new THREE.BoxGeometry(5.2, 1.75, 2.1)
  const longHood = new THREE.Mesh(longHoodGeo, bodyMat)
  longHood.position.set(-2.2, baseY + 1.75 / 2, 0)
  longHood.castShadow = true
  group.add(longHood)

  // Front Cab Windshield
  const winGeo = new THREE.BoxGeometry(0.08, 0.55, 0.72)
  const winLeft = new THREE.Mesh(winGeo, glassMat)
  winLeft.position.set(2.02, baseY + 1.65, -0.48)
  group.add(winLeft)

  const winRight = new THREE.Mesh(winGeo, glassMat)
  winRight.position.set(2.02, baseY + 1.65, 0.48)
  group.add(winRight)

  // Headlight on Front Nose
  const hlGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16)
  const hl = new THREE.Mesh(hlGeo, headlightMat)
  hl.rotation.z = Math.PI / 2
  hl.position.set(4.82, baseY + 0.95, 0)
  group.add(hl)

  if (headlightsOn) {
    const spot = new THREE.SpotLight(0xfff5d1, 3.5, 20, Math.PI / 6, 0.4, 1)
    spot.position.set(5.0, baseY + 0.95, 0)
    spot.target.position.set(14, 0, 0)
    group.add(spot)
    group.add(spot.target)
    lightsRef.current.push(spot)
  }

  // Radiator Grill at Rear
  const radGrillGeo = new THREE.BoxGeometry(0.06, 1.2, 1.6)
  const radGrill = new THREE.Mesh(radGrillGeo, grillMat)
  radGrill.position.set(-4.82, baseY + 1.0, 0)
  group.add(radGrill)

  // Side Livery Stripes
  const stripeOrangeGeo = new THREE.BoxGeometry(9.6, 0.18, 2.42)
  const stripeOrange = new THREE.Mesh(stripeOrangeGeo, orangeStripeMat)
  stripeOrange.position.set(-0.1, baseY + 0.45, 0)
  group.add(stripeOrange)

  const stripeBlueGeo = new THREE.BoxGeometry(9.6, 0.12, 2.42)
  const stripeBlue = new THREE.Mesh(stripeBlueGeo, blueStripeMat)
  stripeBlue.position.set(-0.1, baseY + 0.64, 0)
  group.add(stripeBlue)
}

/* ═══════════════════════════════════════════════════════════════
   3. CC 203 (GE U20C) - Aerodinamis Hidung Miring Panjang
   ═══════════════════════════════════════════════════════════════ */
function buildCC203Body(group, baseY, glassMat, grillMat, headlightMat, headlightsOn, lightsRef) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.25, roughness: 0.3 })
  const orangeStripeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3, roughness: 0.4 })
  const blueStripeMat = new THREE.MeshStandardMaterial({ color: 0x0f2c59, metalness: 0.4, roughness: 0.3 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 })

  // Aerodynamic Sloped Cab Front (Wedge profile)
  const cabGeo = new THREE.BoxGeometry(2.4, 2.15, 2.38)
  const cab = new THREE.Mesh(cabGeo, bodyMat)
  cab.position.set(3.2, baseY + 2.15 / 2, 0)
  cab.castShadow = true
  group.add(cab)

  // Slanted aerodynamic front nose cone
  const noseWedgeGeo = new THREE.BoxGeometry(1.6, 1.4, 2.35)
  const noseWedge = new THREE.Mesh(noseWedgeGeo, bodyMat)
  noseWedge.rotation.z = -Math.PI / 5.5
  noseWedge.position.set(4.5, baseY + 0.95, 0)
  noseWedge.castShadow = true
  group.add(noseWedge)

  // Slanted Aerodynamic Windshields
  const winGeo = new THREE.BoxGeometry(0.08, 0.65, 0.8)
  const winLeft = new THREE.Mesh(winGeo, glassMat)
  winLeft.rotation.z = -Math.PI / 8
  winLeft.position.set(4.35, baseY + 1.62, -0.52)
  group.add(winLeft)

  const winRight = new THREE.Mesh(winGeo, glassMat)
  winRight.rotation.z = -Math.PI / 8
  winRight.position.set(4.35, baseY + 1.62, 0.52)
  group.add(winRight)

  // Long Rear Engine Hood
  const longHoodGeo = new THREE.BoxGeometry(6.6, 1.85, 2.2)
  const longHood = new THREE.Mesh(longHoodGeo, bodyMat)
  longHood.position.set(-1.3, baseY + 1.85 / 2, 0)
  longHood.castShadow = true
  group.add(longHood)

  // Curved Top Roof on Long Hood
  const roofGeo = new THREE.CylinderGeometry(1.1, 1.1, 6.6, 16, 1, false, 0, Math.PI)
  const roof = new THREE.Mesh(roofGeo, roofMat)
  roof.rotation.z = Math.PI / 2
  roof.rotation.y = Math.PI / 2
  roof.position.set(-1.3, baseY + 1.85, 0)
  group.add(roof)

  // Streamlined Dynamic Stripes
  const stripeOrangeGeo = new THREE.BoxGeometry(9.6, 0.22, 2.4)
  const stripeOrange = new THREE.Mesh(stripeOrangeGeo, orangeStripeMat)
  stripeOrange.position.set(0.1, baseY + 0.48, 0)
  group.add(stripeOrange)

  const stripeBlueGeo = new THREE.BoxGeometry(9.6, 0.16, 2.4)
  const stripeBlue = new THREE.Mesh(stripeBlueGeo, blueStripeMat)
  stripeBlue.position.set(0.1, baseY + 0.72, 0)
  group.add(stripeBlue)

  // Twin Headlights on Wedge Nose
  const hlGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16)
  const hl = new THREE.Mesh(hlGeo, headlightMat)
  hl.rotation.z = Math.PI / 2
  hl.position.set(5.15, baseY + 0.95, 0)
  group.add(hl)

  if (headlightsOn) {
    const spot = new THREE.SpotLight(0xfff5d1, 3.8, 22, Math.PI / 6, 0.4, 1)
    spot.position.set(5.3, baseY + 0.95, 0)
    spot.target.position.set(15, 0, 0)
    group.add(spot)
    group.add(spot.target)
    lightsRef.current.push(spot)
  }
}

/* ═══════════════════════════════════════════════════════════════
   4. CC 300 (INKA) - Merah Putih Diesel Hidrolik Modern
   ═══════════════════════════════════════════════════════════════ */
function buildCC300Body(group, baseY, glassMat, grillMat, headlightMat, headlightsOn, lightsRef) {
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.3 })
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.3 })
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5, roughness: 0.5 })

  const bodyLength = 10.6
  const bodyWidth = 2.42
  const bodyHeight = 2.2
  const bodyCenterY = baseY + bodyHeight / 2

  // Boxy European-style body
  const bodyGeo = new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth)
  const body = new THREE.Mesh(bodyGeo, redMat)
  body.position.set(0, bodyCenterY, 0)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  // White Speedline Accent
  const whiteBandGeo = new THREE.BoxGeometry(bodyLength + 0.02, 0.32, bodyWidth + 0.02)
  const whiteBand = new THREE.Mesh(whiteBandGeo, whiteMat)
  whiteBand.position.set(0, baseY + 0.65, 0)
  group.add(whiteBand)

  // Dark Roof Panel
  const roofGeo = new THREE.BoxGeometry(bodyLength, 0.25, bodyWidth - 0.2)
  const roof = new THREE.Mesh(roofGeo, blackMat)
  roof.position.set(0, baseY + bodyHeight + 0.1, 0)
  roof.castShadow = true
  group.add(roof)

  // Double Cab Windows (Depan & Belakang)
  const cc300CabEnds = [-bodyLength / 2, bodyLength / 2]
  cc300CabEnds.forEach((xEnd, idx) => {
    const dir = xEnd > 0 ? 1 : -1

    // Large Windshields
    const winGeo = new THREE.BoxGeometry(0.08, 0.68, 0.85)
    const winLeft = new THREE.Mesh(winGeo, glassMat)
    winLeft.position.set(xEnd + dir * 0.02, bodyCenterY + 0.45, -0.52)
    group.add(winLeft)

    const winRight = new THREE.Mesh(winGeo, glassMat)
    winRight.position.set(xEnd + dir * 0.02, bodyCenterY + 0.45, 0.52)
    group.add(winRight)

    // Sleek LED Headlights (Khas INKA)
    const hlGeo = new THREE.BoxGeometry(0.08, 0.14, 0.38)
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat)
    hlLeft.position.set(xEnd + dir * 0.02, baseY + 0.82, -0.65)
    group.add(hlLeft)

    const hlRight = new THREE.Mesh(hlGeo, headlightMat)
    hlRight.position.set(xEnd + dir * 0.02, baseY + 0.82, 0.65)
    group.add(hlRight)

    if (headlightsOn && dir > 0) {
      const spot = new THREE.SpotLight(0xfff5d1, 3.8, 22, Math.PI / 6, 0.4, 1)
      spot.position.set(xEnd + 0.2, baseY + 0.82, 0)
      spot.target.position.set(xEnd + 12, 0, 0)
      group.add(spot)
      group.add(spot.target)
      lightsRef.current.push(spot)
    }
  })

  // Top Exhaust Fan Grills
  const fanPositions = [-1.5, 0, 1.5]
  fanPositions.forEach((gx) => {
    const grillGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16)
    const fanGrill = new THREE.Mesh(grillGeo, grillMat)
    fanGrill.position.set(gx, baseY + bodyHeight + 0.24, 0)
    group.add(fanGrill)
  })
}

// ── Cleanup Helper ──
function disposeMesh(mesh) {
  if (!mesh) return
  if (mesh.geometry) mesh.geometry.dispose()
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((mat) => mat.dispose())
    } else {
      mesh.material.dispose()
    }
  }
  if (mesh.children) {
    mesh.children.forEach(disposeMesh)
  }
}

