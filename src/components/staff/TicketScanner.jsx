'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff } from 'lucide-react'

/**
 * Camera QR scanner for gate staff. Calls onScan(text) once per distinct code;
 * the same code is ignored for `cooldownMs` to avoid double validation.
 */
export default function TicketScanner({ onScan, paused = false, cooldownMs = 3000 }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const frameRef = useRef(0)
  const lastScanRef = useRef({ text: '', at: 0 })
  const onScanRef = useRef(onScan)
  const pausedRef = useRef(paused)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { onScanRef.current = onScan }, [onScan])
  useEffect(() => { pausedRef.current = paused }, [paused])

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
  }, [])

  useEffect(() => stop, [stop])

  async function start() {
    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      if (video.readyState === video.HAVE_ENOUGH_DATA && !pausedRef.current) {
        const width = video.videoWidth
        const height = video.videoHeight
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d', { willReadFrequently: true })
        context.drawImage(video, 0, 0, width, height)
        const result = jsQR(context.getImageData(0, 0, width, height).data, width, height, { inversionAttempts: 'dontInvert' })
        const text = result?.data?.trim()
        const now = Date.now()
        if (text && (text !== lastScanRef.current.text || now - lastScanRef.current.at > cooldownMs)) {
          lastScanRef.current = { text, at: now }
          onScanRef.current(text)
        }
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini tidak mendukung kamera. Gunakan input manual.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      await video.play()
      setActive(true)
      frameRef.current = requestAnimationFrame(tick)
    } catch {
      stop()
      setError('Akses kamera ditolak atau tidak tersedia. Gunakan input manual.')
    }
  }

  return (
    <div className="rh-scanner">
      <div className="rh-scanner-view">
        <video ref={videoRef} muted playsInline style={{ display: active ? 'block' : 'none' }} />
        <canvas ref={canvasRef} hidden />
        {active && <span className="rh-scanner-frame" aria-hidden="true" />}
        {!active && <div className="rh-scanner-idle"><Camera size={32} /></div>}
      </div>
      {error && <p role="alert" style={{ color: 'var(--rh-danger)', margin: 0, fontSize: '0.875rem' }}>{error}</p>}
      <button type="button" className={`rh-btn ${active ? 'rh-btn-ghost' : 'rh-btn-primary'}`} onClick={active ? stop : start}>
        {active ? <><CameraOff size={16} /> Matikan kamera</> : <><Camera size={16} /> Aktifkan scanner</>}
      </button>
    </div>
  )
}
