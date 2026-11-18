'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Camera, RotateCw, Lightbulb, Download, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export const LOCOMOTIVES = [
  {
    id: 'cc206',
    code: 'CC 206',
    fullName: 'GE CM20EMP',
    nickname: 'Double Cab',
    type: 'Diesel Elektrik',
    builder: 'GE Transportation, USA',
    power: '2.250 HP',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (6 Gandar)',
    weight: '90 Ton',
    description:
      'Lokomotif kabin ganda andalan PT KAI untuk kereta eksekutif dan angkutan logistik lintas Jawa tanpa perlu diputar di turntable.',
  },
  {
    id: 'cc201',
    code: 'CC 201',
    fullName: 'GE U18C',
    nickname: 'Hidung Miring',
    type: 'Diesel Elektrik',
    builder: 'GE Transportation, USA',
    power: '1.950 HP',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (6 Gandar)',
    weight: '84 Ton',
    description:
      'Lokomotif pekerja keras paling legendaris sejak 1977 dengan short hood rendah, kabin tinggi, dan walkway samping untuk jalur pegunungan.',
  },
  {
    id: 'cc203',
    code: 'CC 203',
    fullName: 'GE U20C',
    nickname: 'Moncong Hiu',
    type: 'Diesel Elektrik',
    builder: 'GE / PT INKA Madiun',
    power: '2.150 HP',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (6 Gandar)',
    weight: '84 Ton',
    description:
      'Dikenal dengan hidung aerodinamis miring khas era peluncuran KA Argo Bromo dan Argo Gede pada 1995.',
  },
  {
    id: 'cc300',
    code: 'CC 300',
    fullName: 'INKA DH-2200',
    nickname: 'Merah Putih',
    type: 'Diesel Hidrolik',
    builder: 'PT INKA Madiun',
    power: '2.200 HP',
    topSpeed: '120 km/jam',
    axle: 'Co-Co (6 Gandar)',
    weight: '84 Ton',
    description:
      'Lokomotif diesel hidrolik karya PT INKA Madiun dengan kabin ganda, masker kaca hitam, dan kemampuan menerjang genangan banjir.',
  },
]

function getCameraPositionForAspect(aspect) {
  if (aspect < 0.9) return new THREE.Vector3(14.5, 5.4, 13.0)
  if (aspect < 1.3) return new THREE.Vector3(12.5, 4.8, 11.0)
  return new THREE.Vector3(10.8, 4.2, 9.2)
}

export default function Locomotive3DViewer({ onPhotoCaptured }) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const trainGroupRef = useRef(null)
  const lightsRef = useRef([])
  const autoRotateRef = useRef(true)

  const [activeLocoId, setActiveLocoId] = useState('cc206')
  const [autoRotate, setAutoRotate] = useState(true)
  const [headlightsOn, setHeadlightsOn] = useState(true)
  const [isSnapshotting, setIsSnapshotting] = useState(false)

  const activeLoco = LOCOMOTIVES.find((l) => l.id === activeLocoId) || LOCOMOTIVES[0]

  useEffect(() => {
    autoRotateRef.current = autoRotate
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
    }
  }, [autoRotate])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 460
    const aspect = width / height

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b1626)
    scene.fog = new THREE.FogExp2(0x0b1626, 0.018)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100)
    camera.position.copy(getCameraPositionForAspect(aspect))
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    container.replaceChildren(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2 - 0.03
    controls.minDistance = 5.5
    controls.maxDistance = 24
    controls.target.set(0, 1.35, 0)
    controls.autoRotate = autoRotateRef.current
    controls.autoRotateSpeed = 1.0
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff6e8, 1.9)
    keyLight.position.set(12, 18, 11)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 42
    keyLight.shadow.camera.left = -10
    keyLight.shadow.camera.right = 10
    keyLight.shadow.camera.top = 10
    keyLight.shadow.camera.bottom = -10
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.0)
    rimLight.position.set(-14, 10, -12)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.5)
    fillLight.position.set(0, 4, -12)
    scene.add(fillLight)

    buildRailwayEnvironment(scene)

    const trainGroup = new THREE.Group()
    scene.add(trainGroup)
    trainGroupRef.current = trainGroup

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotateRef.current
        controlsRef.current.update()
      }
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
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

  useEffect(() => {
    const trainGroup = trainGroupRef.current
    const scene = sceneRef.current
    if (!trainGroup || !scene) return

    while (trainGroup.children.length > 0) {
      const obj = trainGroup.children[0]
      trainGroup.remove(obj)
      disposeMesh(obj)
    }

    lightsRef.current = []
    buildLocomotive(trainGroup, activeLocoId, headlightsOn, lightsRef)
  }, [activeLocoId, headlightsOn])

  const handleResetCamera = () => {
    const container = containerRef.current
    if (!cameraRef.current || !controlsRef.current || !container) return
    const aspect = (container.clientWidth || 800) / (container.clientHeight || 460)
    cameraRef.current.position.copy(getCameraPositionForAspect(aspect))
    controlsRef.current.target.set(0, 1.35, 0)
    controlsRef.current.update()
  }

  const handleCaptureSnapshot = () => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    if (!renderer || !scene || !camera) return

    setIsSnapshotting(true)
    try {
      renderer.render(scene, camera)
      const dataUrl = renderer.domElement.toDataURL('image/png')

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `RAILHUB-3D-${activeLoco.code.replace(/\s+/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Foto 3D ${activeLoco.code} diunduh`)
      if (onPhotoCaptured) {
        onPhotoCaptured({ loco: activeLoco, imageUrl: dataUrl })
      }
    } catch {
      toast.error('Gagal mengambil foto 3D')
    } finally {
      setTimeout(() => setIsSnapshotting(false), 500)
    }
  }

  return (
    <div className="w-full border border-[var(--rh-border)] bg-white rounded-xl overflow-hidden">
      {/* Top Toolbar: Separated from canvas so mobile viewport stays unobstructed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-[var(--rh-border)] bg-[var(--rh-surface)]">
        {/* Locomotive Series Selector */}
        <div
          role="tablist"
          aria-label="Pilih seri lokomotif"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
        >
          {LOCOMOTIVES.map((loco) => {
            const isActive = loco.id === activeLocoId
            return (
              <button
                key={loco.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveLocoId(loco.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[var(--rh-blue)] text-white'
                    : 'bg-white text-[var(--rh-text)] border border-[var(--rh-border)] hover:border-[var(--rh-blue)]'
                }`}
              >
                {loco.code}
              </button>
            )
          })}
        </div>

        {/* Viewer Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHeadlightsOn((v) => !v)}
              aria-label={headlightsOn ? 'Matikan lampu sorot' : 'Nyalakan lampu sorot'}
              title={headlightsOn ? 'Matikan Lampu' : 'Nyalakan Lampu'}
              className={`h-9 w-9 rounded-lg flex items-center justify-center border cursor-pointer transition-colors ${
                headlightsOn
                  ? 'bg-[var(--rh-orange)]/10 border-[var(--rh-orange)] text-[var(--rh-orange)]'
                  : 'bg-white border-[var(--rh-border)] text-[var(--rh-text)]'
              }`}
            >
              <Lightbulb size={16} />
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              aria-label={autoRotate ? 'Jeda putaran otomatis' : 'Aktifkan putaran otomatis'}
              title={autoRotate ? 'Jeda Putaran' : 'Putar 360°'}
              className={`h-9 w-9 rounded-lg flex items-center justify-center border cursor-pointer transition-colors ${
                autoRotate
                  ? 'bg-[var(--rh-blue)]/10 border-[var(--rh-blue)] text-[var(--rh-blue)]'
                  : 'bg-white border-[var(--rh-border)] text-[var(--rh-text)]'
              }`}
            >
              <RotateCw size={16} />
            </button>

            <button
              type="button"
              onClick={handleResetCamera}
              aria-label="Reset sudut pandang kamera"
              title="Reset Kamera"
              className="h-9 px-2.5 rounded-lg flex items-center justify-center border border-[var(--rh-border)] bg-white text-[var(--rh-text)] text-xs font-semibold cursor-pointer hover:border-[var(--rh-blue)] transition-colors"
            >
              Reset
            </button>
          </div>

          <button
            type="button"
            onClick={handleCaptureSnapshot}
            disabled={isSnapshotting}
            className="h-9 px-3.5 rounded-lg flex items-center gap-1.5 bg-[var(--rh-orange)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSnapshotting ? <Check size={14} /> : <Camera size={14} />}
            <span>Simpan PNG</span>
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative bg-[#0b1626]">
        <div
          ref={containerRef}
          className="w-full h-[300px] sm:h-[420px] lg:h-[500px] cursor-grab active:cursor-grabbing"
          aria-label={`Model 3D interaktif lokomotif ${activeLoco.code}`}
        />
        <div className="pointer-events-none absolute bottom-3.5 right-4 z-10 text-[11px] leading-normal text-white/70 bg-[#0b1626]/80 px-3 py-1 rounded-md border border-white/10">
          Geser untuk memutar • Cubit/scroll untuk zoom
        </div>
      </div>

      {/* Specs Strip: Clean flat grid, no nested box-slop */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-t border-[var(--rh-border)] bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-baseline gap-2.5 mb-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-[var(--rh-blue)] m-0">
                {activeLoco.code}
              </h3>
              <span className="text-xs font-semibold text-[var(--rh-orange)]">
                {activeLoco.fullName} · {activeLoco.nickname}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-85 m-0 leading-relaxed">
              {activeLoco.description}
            </p>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[var(--rh-border)] lg:pl-6 m-0">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[var(--rh-text-3)]">Daya</dt>
              <dd className="text-sm font-bold text-[var(--rh-blue)] m-0">{activeLoco.power}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[var(--rh-text-3)]">Kecepatan</dt>
              <dd className="text-sm font-bold text-[var(--rh-blue)] m-0">{activeLoco.topSpeed}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[var(--rh-text-3)]">Gandar</dt>
              <dd className="text-sm font-bold text-[var(--rh-blue)] m-0">{activeLoco.axle}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[var(--rh-text-3)]">Berat</dt>
              <dd className="text-sm font-bold text-[var(--rh-blue)] m-0">{activeLoco.weight}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   3D PROCEDURAL LOCOMOTIVE BUILDER
   Accurate proportions & silhouettes for CC 206, CC 201, CC 203, CC 300
   ═══════════════════════════════════════════════════════════════ */

function buildRailwayEnvironment(scene) {
  const groundGeo = new THREE.PlaneGeometry(70, 50)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0d192b,
    roughness: 0.95,
    metalness: 0.05,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.05
  ground.receiveShadow = true
  scene.add(ground)

  // Trapezoid-like Ballast Bed
  const ballastGeo = new THREE.BoxGeometry(36, 0.24, 3.8)
  const ballastMat = new THREE.MeshStandardMaterial({
    color: 0x333a45,
    roughness: 0.95,
    metalness: 0.05,
  })
  const ballast = new THREE.Mesh(ballastGeo, ballastMat)
  ballast.position.set(0, 0.08, 0)
  ballast.receiveShadow = true
  scene.add(ballast)

  // Concrete Sleepers (Bantalan Rel)
  const sleeperGeo = new THREE.BoxGeometry(0.32, 0.14, 2.8)
  const sleeperMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85,
    metalness: 0.1,
  })
  for (let x = -16; x <= 16; x += 0.72) {
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat)
    sleeper.position.set(x, 0.24, 0)
    sleeper.receiveShadow = true
    scene.add(sleeper)
  }

  // Steel Rails (1.067 mm Cape Gauge scaled proportionally)
  const railGeo = new THREE.BoxGeometry(36, 0.14, 0.1)
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.85,
    roughness: 0.25,
  })

  const leftRail = new THREE.Mesh(railGeo, railMat)
  leftRail.position.set(0, 0.38, -0.78)
  leftRail.castShadow = true
  scene.add(leftRail)

  const rightRail = new THREE.Mesh(railGeo, railMat)
  rightRail.position.set(0, 0.38, 0.78)
  rightRail.castShadow = true
  scene.add(rightRail)
}

function buildLocomotive(group, type, headlightsOn, lightsRef) {
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, metalness: 0.55, roughness: 0.45 })
  const steelWheelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 })
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f2744,
    metalness: 0.15,
    roughness: 0.08,
    opacity: 0.92,
    transparent: true,
  })
  const grillMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.6 })
  const handrailMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.3 })
  const headlightMat = new THREE.MeshStandardMaterial({
    color: headlightsOn ? 0xfff7d6 : 0x475569,
    emissive: headlightsOn ? 0xffea9f : 0x000000,
    emissiveIntensity: headlightsOn ? 2.6 : 0,
    roughness: 0.2,
  })
  const markerRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: headlightsOn ? 0xef4444 : 0x000000,
    emissiveIntensity: headlightsOn ? 1.2 : 0,
    roughness: 0.3,
  })

  const chassisLength = 11.4
  const chassisWidth = 2.44
  const chassisHeight = 0.32
  const chassisY = 1.28

  // Main Underframe Deck
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(chassisLength, chassisHeight, chassisWidth), chassisMat)
  chassis.position.set(0, chassisY, 0)
  chassis.castShadow = true
  chassis.receiveShadow = true
  group.add(chassis)

  // Underframe Fuel Tank + Air Reservoirs
  const fuelTank = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.56, 1.55), chassisMat)
  fuelTank.position.set(0, chassisY - 0.34, 0)
  fuelTank.castShadow = true
  group.add(fuelTank)

  const airTankGeo = new THREE.CylinderGeometry(0.16, 0.16, 2.2, 12)
  const airTankL = new THREE.Mesh(airTankGeo, chassisMat)
  airTankL.rotation.z = Math.PI / 2
  airTankL.position.set(0, chassisY - 0.28, -0.92)
  group.add(airTankL)

  const airTankR = new THREE.Mesh(airTankGeo, chassisMat)
  airTankR.rotation.z = Math.PI / 2
  airTankR.position.set(0, chassisY - 0.28, 0.92)
  group.add(airTankR)

  // Two Co-Co Bogies (Wheel radius 0.38, wheel center Y = 0.83 -> bottom touches rail top at 0.45)
  buildBogie(group, -3.45, 0.93, steelWheelMat, chassisMat)
  buildBogie(group, 3.45, 0.93, steelWheelMat, chassisMat)

  // Angled Cowcatchers & Janney Couplers
  buildCouplerAndPilot(group, chassisLength / 2 + 0.05, chassisY - 0.12, 1, type === 'cc300' ? 0x18181b : 0xea580c)
  buildCouplerAndPilot(group, -chassisLength / 2 - 0.05, chassisY - 0.12, -1, type === 'cc300' ? 0x18181b : 0xea580c)

  const baseY = chassisY + chassisHeight / 2

  if (type === 'cc206') {
    buildCC206Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef)
  } else if (type === 'cc201') {
    buildCC201Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef)
  } else if (type === 'cc203') {
    buildCC203Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef)
  } else if (type === 'cc300') {
    buildCC300Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef)
  }
}

function buildBogie(group, xPos, yPos, wheelMat, frameMat) {
  const bogie = new THREE.Group()
  bogie.position.set(xPos, yPos, 0)

  // Bogie sideframes (left & right) + bolster
  const sideFrameGeo = new THREE.BoxGeometry(3.15, 0.24, 0.2)
  const leftFrame = new THREE.Mesh(sideFrameGeo, frameMat)
  leftFrame.position.set(0, 0.04, -1.02)
  leftFrame.castShadow = true
  bogie.add(leftFrame)

  const rightFrame = new THREE.Mesh(sideFrameGeo, frameMat)
  rightFrame.position.set(0, 0.04, 1.02)
  rightFrame.castShadow = true
  bogie.add(rightFrame)

  const bolster = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.24, 1.85), frameMat)
  bolster.position.set(0, 0.08, 0)
  bogie.add(bolster)

  const wheelRadius = 0.38
  const wheelWidth = 0.14
  const axleOffsets = [-1.1, 0, 1.1]

  axleOffsets.forEach((ox) => {
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.85, 12), wheelMat)
    axle.rotation.x = Math.PI / 2
    axle.position.set(ox, -0.1, 0)
    bogie.add(axle)

    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24)
    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat)
    leftWheel.rotation.x = Math.PI / 2
    leftWheel.position.set(ox, -0.1, -0.78)
    leftWheel.castShadow = true
    bogie.add(leftWheel)

    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat)
    rightWheel.rotation.x = Math.PI / 2
    rightWheel.position.set(ox, -0.1, 0.78)
    rightWheel.castShadow = true
    bogie.add(rightWheel)

    // Axlebox caps
    const capGeo = new THREE.BoxGeometry(0.24, 0.24, 0.16)
    const capL = new THREE.Mesh(capGeo, frameMat)
    capL.position.set(ox, -0.08, -1.05)
    bogie.add(capL)

    const capR = new THREE.Mesh(capGeo, frameMat)
    capR.position.set(ox, -0.08, 1.05)
    bogie.add(capR)
  })

  group.add(bogie)
}

function buildCouplerAndPilot(group, xPos, yPos, dir, pilotColor) {
  const pilotMat = new THREE.MeshStandardMaterial({ color: pilotColor, metalness: 0.35, roughness: 0.5 })
  const couplerMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 })

  // Sloped Wedge Cowcatcher
  const plowShape = new THREE.Shape()
  plowShape.moveTo(0, 0)
  plowShape.lineTo(0.45, 0)
  plowShape.lineTo(0.15, 0.48)
  plowShape.lineTo(0, 0.48)
  plowShape.closePath()

  const plowGeo = new THREE.ExtrudeGeometry(plowShape, { depth: 2.25, bevelEnabled: false })
  plowGeo.translate(0, -0.35, -1.125)
  const plow = new THREE.Mesh(plowGeo, pilotMat)
  plow.position.set(xPos, yPos, 0)
  if (dir < 0) plow.rotation.y = Math.PI
  plow.castShadow = true
  group.add(plow)

  // Janney Coupler
  const coupler = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.24), couplerMat)
  coupler.position.set(xPos + dir * 0.34, yPos + 0.02, 0)
  coupler.castShadow = true
  group.add(coupler)
}

function addSpotLight(group, x, y, z, targetX, lightsRef) {
  const spot = new THREE.SpotLight(0xfff4cc, 65, 34, Math.PI / 5.5, 0.55, 1.4)
  spot.position.set(x, y, z)
  spot.target.position.set(targetX, 0.35, z)
  group.add(spot)
  group.add(spot.target)
  lightsRef.current.push(spot)

  // Visible volumetric forward beam locked to the front headlight (+X)
  const beamLength = 10.5
  const beamGeo = new THREE.ConeGeometry(1.75, beamLength, 24, 1, true)
  beamGeo.translate(0, -beamLength / 2, 0)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff3c4,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const beam = new THREE.Mesh(beamGeo, beamMat)
  beam.position.set(x, y, z)
  beam.rotation.z = Math.PI / 2 - 0.12
  group.add(beam)
}

/* ── 1. CC 206 (GE CM20EMP) — Double Cab ── */
function buildCC206Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.35 })
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.3, roughness: 0.4 })
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1a428a, metalness: 0.35, roughness: 0.35 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 })

  const len = 10.6
  const width = 2.38
  const height = 2.05

  // Main Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, height, width), whiteMat)
  body.position.set(0, baseY + height / 2, 0)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  // Chamfered Roof Crown along X (using ExtrudeGeometry so orientation is guaranteed along X)
  const roofShape = new THREE.Shape()
  roofShape.moveTo(-len / 2 + 0.05, 0)
  roofShape.lineTo(len / 2 - 0.05, 0)
  roofShape.lineTo(len / 2 - 0.35, 0.24)
  roofShape.lineTo(-len / 2 + 0.35, 0.24)
  roofShape.closePath()

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: width - 0.12, bevelEnabled: false })
  roofGeo.translate(0, baseY + height, -(width - 0.12) / 2)
  const roof = new THREE.Mesh(roofGeo, roofMat)
  roof.castShadow = true
  group.add(roof)

  // Flush Livery Stripes
  const orangeBand = new THREE.Mesh(new THREE.BoxGeometry(len + 0.02, 0.22, width + 0.02), orangeMat)
  orangeBand.position.set(0, baseY + 0.42, 0)
  group.add(orangeBand)

  const blueBand = new THREE.Mesh(new THREE.BoxGeometry(len + 0.02, 0.18, width + 0.02), blueMat)
  blueBand.position.set(0, baseY + 0.64, 0)
  group.add(blueBand)

  // Side Radiator Grilles & Louvers
  const grilleGeo = new THREE.BoxGeometry(3.4, 0.72, width + 0.03)
  const grille = new THREE.Mesh(grilleGeo, grillMat)
  grille.position.set(0, baseY + 1.48, 0)
  group.add(grille)

  // Roof AC Units, Exhaust Stack, & Dynamic Brake Blister (resting cleanly on top of roof crown)
  const acGeo = new THREE.BoxGeometry(1.3, 0.18, 1.3)
  const ac1 = new THREE.Mesh(acGeo, roofMat)
  ac1.position.set(-3.1, baseY + height + 0.32, 0)
  group.add(ac1)

  const ac2 = new THREE.Mesh(acGeo, roofMat)
  ac2.position.set(3.1, baseY + height + 0.32, 0)
  group.add(ac2)

  const exhaust = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.55), grillMat)
  exhaust.position.set(-0.9, baseY + height + 0.33, 0)
  group.add(exhaust)

  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16), grillMat)
  fan.position.set(0.8, baseY + height + 0.29, 0)
  group.add(fan)

  // Symmetrical Double Cabs (Front & Rear)
  ;[-len / 2, len / 2].forEach((xEnd) => {
    const dir = xEnd > 0 ? 1 : -1

    // Front Blue Nose Mask
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, width - 0.15), blueMat)
    mask.position.set(xEnd + dir * 0.01, baseY + 0.85, 0)
    group.add(mask)

    // Split Windshields
    const winGeo = new THREE.BoxGeometry(0.06, 0.54, 0.78)
    const winL = new THREE.Mesh(winGeo, glassMat)
    winL.position.set(xEnd + dir * 0.02, baseY + 1.56, -0.5)
    group.add(winL)

    const winR = new THREE.Mesh(winGeo, glassMat)
    winR.position.set(xEnd + dir * 0.02, baseY + 1.56, 0.5)
    group.add(winR)

    // Side Cab Windows
    const sideWinGeo = new THREE.BoxGeometry(0.95, 0.48, width + 0.03)
    const sideWin = new THREE.Mesh(sideWinGeo, glassMat)
    sideWin.position.set(xEnd - dir * 0.85, baseY + 1.54, 0)
    group.add(sideWin)

    // Top Center Headlight + Lower Twin Headlights + Red Markers
    const topHl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), headlightMat)
    topHl.rotation.z = Math.PI / 2
    topHl.position.set(xEnd + dir * 0.04, baseY + 1.98, 0)
    group.add(topHl)

    ;[-0.65, 0.65].forEach((zOff) => {
      const lowHl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.22), headlightMat)
      lowHl.position.set(xEnd + dir * 0.03, baseY + 0.44, zOff)
      group.add(lowHl)

      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.12), markerRedMat)
      marker.position.set(xEnd + dir * 0.03, baseY + 0.44, zOff + (zOff > 0 ? 0.2 : -0.2))
      group.add(marker)
    })

    // Front Safety Handrails
    ;[-0.95, 0.95].forEach((zOff) => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), handrailMat)
      rail.position.set(xEnd + dir * 0.12, baseY + 0.5, zOff)
      group.add(rail)
    })

    if (headlightsOn && dir > 0) {
      addSpotLight(group, xEnd + 0.2, baseY + 1.98, 0, xEnd + 11, lightsRef)
    }
  })
}

/* ── 2. CC 201 (GE U18C) — Short Hood + High Cab + Narrow Long Hood + Walkways ── */
function buildCC201Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.2, roughness: 0.4 })
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.3, roughness: 0.4 })
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1a428a, metalness: 0.35, roughness: 0.35 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 })

  const hoodWidth = 1.85
  const cabWidth = 2.38

  // 1. Short Hood (Front: X = +2.3 to +4.95)
  const shortLen = 2.65
  const shortH = 1.42
  const shortHood = new THREE.Mesh(new THREE.BoxGeometry(shortLen, shortH, hoodWidth), whiteMat)
  shortHood.position.set(3.62, baseY + shortH / 2, 0)
  shortHood.castShadow = true
  group.add(shortHood)

  // Slanted Short Hood Nose Tip
  const noseTip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, hoodWidth - 0.04), whiteMat)
  noseTip.rotation.z = -Math.PI / 6
  noseTip.position.set(4.85, baseY + 1.24, 0)
  group.add(noseTip)

  // 2. High Driver Cab (X = +0.7 to +2.3)
  const cabLen = 1.65
  const cabH = 2.2
  const cab = new THREE.Mesh(new THREE.BoxGeometry(cabLen, cabH, cabWidth), whiteMat)
  cab.position.set(1.5, baseY + cabH / 2, 0)
  cab.castShadow = true
  group.add(cab)

  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(cabLen + 0.1, 0.14, cabWidth + 0.06), roofMat)
  cabRoof.position.set(1.5, baseY + cabH + 0.07, 0)
  group.add(cabRoof)

  // 3. Narrow Long Engine Hood (Rear: X = -5.05 to +0.7)
  const longLen = 5.75
  const longH = 1.82
  const longHood = new THREE.Mesh(new THREE.BoxGeometry(longLen, longH, hoodWidth), whiteMat)
  longHood.position.set(-2.2, baseY + longH / 2, 0)
  longHood.castShadow = true
  group.add(longHood)

  const longRoof = new THREE.Mesh(new THREE.BoxGeometry(longLen, 0.12, hoodWidth - 0.15), roofMat)
  longRoof.position.set(-2.2, baseY + longH + 0.06, 0)
  group.add(longRoof)

  // Flush Stripes on Narrow Hoods & Cab
  const hoodStripeO = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.18, hoodWidth + 0.02), orangeMat)
  hoodStripeO.position.set(-0.05, baseY + 0.38, 0)
  group.add(hoodStripeO)

  const hoodStripeB = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.14, hoodWidth + 0.02), blueMat)
  hoodStripeB.position.set(-0.05, baseY + 0.56, 0)
  group.add(hoodStripeB)

  const cabStripeO = new THREE.Mesh(new THREE.BoxGeometry(cabLen + 0.02, 0.18, cabWidth + 0.02), orangeMat)
  cabStripeO.position.set(1.5, baseY + 0.38, 0)
  group.add(cabStripeO)

  const cabStripeB = new THREE.Mesh(new THREE.BoxGeometry(cabLen + 0.02, 0.14, cabWidth + 0.02), blueMat)
  cabStripeB.position.set(1.5, baseY + 0.56, 0)
  group.add(cabStripeB)

  // Cab Front, Rear & Side Windows
  const frontWinGeo = new THREE.BoxGeometry(0.06, 0.52, 0.72)
  ;[-0.48, 0.48].forEach((zOff) => {
    const fw = new THREE.Mesh(frontWinGeo, glassMat)
    fw.position.set(2.33, baseY + 1.72, zOff)
    group.add(fw)
  })

  const sideCabWin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.48, cabWidth + 0.03), glassMat)
  sideCabWin.position.set(1.5, baseY + 1.7, 0)
  group.add(sideCabWin)

  // Walkway Handrails along Long & Short Hoods
  ;[-1.12, 1.12].forEach((zOff) => {
    const longRail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 5.6, 8), handrailMat)
    longRail.rotation.z = Math.PI / 2
    longRail.position.set(-2.2, baseY + 0.85, zOff)
    group.add(longRail)

    const shortRail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.5, 8), handrailMat)
    shortRail.rotation.z = Math.PI / 2
    shortRail.position.set(3.65, baseY + 0.85, zOff)
    group.add(shortRail)
  })

  // Exhaust Stack & Rear Radiator Louvers
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.28, 12), grillMat)
  exhaust.position.set(-0.8, baseY + longH + 0.18, 0)
  group.add(exhaust)

  const rearGrill = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 1.35), grillMat)
  rearGrill.position.set(-5.08, baseY + 1.1, 0)
  group.add(rearGrill)

  // Headlights
  const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16), headlightMat)
  hl.rotation.z = Math.PI / 2
  hl.position.set(4.96, baseY + 0.92, 0)
  group.add(hl)

  ;[-0.55, 0.55].forEach((zOff) => {
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.12), markerRedMat)
    marker.position.set(4.96, baseY + 0.38, zOff)
    group.add(marker)
  })

  if (headlightsOn) {
    addSpotLight(group, 5.1, baseY + 0.92, 0, 15, lightsRef)
  }
}

/* ── 3. CC 203 (GE U20C) — Aerodynamic "Moncong Hiu" Streamlined Nose ── */
function buildCC203Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.25, roughness: 0.3 })
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.3, roughness: 0.4 })
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1a428a, metalness: 0.35, roughness: 0.35 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.55, roughness: 0.45 })

  const cabWidth = 2.38
  const hoodWidth = 2.02

  // Streamlined Aerodynamic Nose + Cab Profile using ExtrudeGeometry
  const cabShape = new THREE.Shape()
  cabShape.moveTo(0.8, 0)
  cabShape.lineTo(5.15, 0) // nose bottom front
  cabShape.lineTo(4.75, 0.95) // lower nose slope
  cabShape.lineTo(3.65, 2.15) // slanted windshield top
  cabShape.lineTo(0.8, 2.15) // cab roof back
  cabShape.closePath()

  const cabGeo = new THREE.ExtrudeGeometry(cabShape, { depth: cabWidth, bevelEnabled: false })
  cabGeo.translate(0, baseY, -cabWidth / 2)
  const cabMesh = new THREE.Mesh(cabGeo, whiteMat)
  cabMesh.castShadow = true
  cabMesh.receiveShadow = true
  group.add(cabMesh)

  // Long Engine Hood behind Cab
  const longLen = 5.95
  const longH = 1.88
  const longHood = new THREE.Mesh(new THREE.BoxGeometry(longLen, longH, hoodWidth), whiteMat)
  longHood.position.set(-2.15, baseY + longH / 2, 0)
  longHood.castShadow = true
  group.add(longHood)

  const longRoof = new THREE.Mesh(new THREE.BoxGeometry(longLen, 0.12, hoodWidth - 0.14), roofMat)
  longRoof.position.set(-2.15, baseY + longH + 0.06, 0)
  group.add(longRoof)

  // Slanted Panoramic Windshields
  const winGeo = new THREE.BoxGeometry(0.06, 0.72, 0.78)
  ;[-0.5, 0.5].forEach((zOff) => {
    const win = new THREE.Mesh(winGeo, glassMat)
    win.rotation.z = Math.PI / 4.2
    win.position.set(4.18, baseY + 1.54, zOff)
    group.add(win)
  })

  // Side Cab Windows
  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.48, cabWidth + 0.03), glassMat)
  sideWin.position.set(2.15, baseY + 1.66, 0)
  group.add(sideWin)

  // Flush Stripes on Hood & Cab
  const hoodStripeO = new THREE.Mesh(new THREE.BoxGeometry(longLen, 0.2, hoodWidth + 0.02), orangeMat)
  hoodStripeO.position.set(-2.15, baseY + 0.4, 0)
  group.add(hoodStripeO)

  const hoodStripeB = new THREE.Mesh(new THREE.BoxGeometry(longLen, 0.15, hoodWidth + 0.02), blueMat)
  hoodStripeB.position.set(-2.15, baseY + 0.6, 0)
  group.add(hoodStripeB)

  const cabStripeO = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.2, cabWidth + 0.02), orangeMat)
  cabStripeO.position.set(2.85, baseY + 0.4, 0)
  group.add(cabStripeO)

  const cabStripeB = new THREE.Mesh(new THREE.BoxGeometry(3.95, 0.15, cabWidth + 0.02), blueMat)
  cabStripeB.position.set(2.78, baseY + 0.6, 0)
  group.add(cabStripeB)

  // Walkway Handrails along Long Hood
  ;[-1.14, 1.14].forEach((zOff) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 5.8, 8), handrailMat)
    rail.rotation.z = Math.PI / 2
    rail.position.set(-2.1, baseY + 0.85, zOff)
    group.add(rail)
  })

  // Exhaust & Rear Grille
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.26, 12), grillMat)
  exhaust.position.set(-0.9, baseY + longH + 0.18, 0)
  group.add(exhaust)

  const rearGrill = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 1.5), grillMat)
  rearGrill.position.set(-5.14, baseY + 1.15, 0)
  group.add(rearGrill)

  // Twin Nose Headlights
  ;[-0.36, 0.36].forEach((zOff) => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), headlightMat)
    hl.rotation.z = Math.PI / 2
    hl.position.set(4.85, baseY + 0.86, zOff)
    group.add(hl)
  })

  if (headlightsOn) {
    addSpotLight(group, 5.05, baseY + 0.86, 0, 15, lightsRef)
  }
}

/* ── 4. CC 300 (PT INKA) — Merah Putih Diesel Hidrolik ── */
function buildCC300Body(group, baseY, glassMat, grillMat, handrailMat, headlightMat, markerRedMat, headlightsOn, lightsRef) {
  const redMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.3, roughness: 0.35 })
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.35 })
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5, roughness: 0.5 })

  const len = 10.6
  const width = 2.4

  // Tapered Double-Cab Profile
  const profile = new THREE.Shape()
  profile.moveTo(-len / 2, 0)
  profile.lineTo(len / 2, 0)
  profile.lineTo(len / 2 - 0.18, 2.15)
  profile.lineTo(-len / 2 + 0.18, 2.15)
  profile.closePath()

  const bodyGeo = new THREE.ExtrudeGeometry(profile, { depth: width, bevelEnabled: false })
  bodyGeo.translate(0, baseY, -width / 2)
  const body = new THREE.Mesh(bodyGeo, redMat)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  // White Speedline Band
  const whiteBand = new THREE.Mesh(new THREE.BoxGeometry(len - 0.06, 0.3, width + 0.02), whiteMat)
  whiteBand.position.set(0, baseY + 0.65, 0)
  group.add(whiteBand)

  // Dark Roof & 3 Cooling Fans
  const roof = new THREE.Mesh(new THREE.BoxGeometry(len - 0.42, 0.18, width - 0.18), blackMat)
  roof.position.set(0, baseY + 2.22, 0)
  roof.castShadow = true
  group.add(roof)

  ;[-1.6, 0, 1.6].forEach((gx) => {
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16), grillMat)
    fan.position.set(gx, baseY + 2.34, 0)
    group.add(fan)
  })

  // Side Engine Louvers
  const louvers = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.65, width + 0.03), grillMat)
  louvers.position.set(0, baseY + 1.45, 0)
  group.add(louvers)

  // Symmetrical Double Cabs with Black Windshield Mask
  ;[-len / 2, len / 2].forEach((xEnd) => {
    const dir = xEnd > 0 ? 1 : -1

    // Characteristic Black Window Mask
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, width - 0.22), blackMat)
    mask.rotation.z = dir * -0.08
    mask.position.set(xEnd - dir * 0.12, baseY + 1.56, 0)
    group.add(mask)

    // Twin Windshields
    ;[-0.52, 0.52].forEach((zOff) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.82), glassMat)
      win.rotation.z = dir * -0.08
      win.position.set(xEnd - dir * 0.11, baseY + 1.56, zOff)
      group.add(win)
    })

    // Side Cab Windows
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.48, width + 0.03), glassMat)
    sideWin.position.set(xEnd - dir * 0.95, baseY + 1.56, 0)
    group.add(sideWin)

    // Sleek Rectangular LED Headlights & Red Markers
    ;[-0.68, 0.68].forEach((zOff) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.34), headlightMat)
      hl.position.set(xEnd - dir * 0.03, baseY + 0.72, zOff)
      group.add(hl)

      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.14), markerRedMat)
      marker.position.set(xEnd - dir * 0.03, baseY + 0.72, zOff + (zOff > 0 ? 0.26 : -0.26))
      group.add(marker)
    })

    if (headlightsOn && dir > 0) {
      addSpotLight(group, xEnd + 0.15, baseY + 0.72, 0, xEnd + 12, lightsRef)
    }
  })
}

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
