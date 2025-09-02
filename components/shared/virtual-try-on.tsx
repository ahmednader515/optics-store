"use client"

import React from 'react'
import { Button } from '@/components/ui/button'

type VirtualTryOnProps = {
  overlayImageUrl?: string
}

type Point = { x: number; y: number }

export default function VirtualTryOn({ overlayImageUrl }: VirtualTryOnProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const overlayRef = React.useRef<HTMLDivElement | null>(null)

  const [isStarting, setIsStarting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = React.useState(true)
  const [autoFollow, setAutoFollow] = React.useState<boolean>(false)
  const autoFollowRef = React.useRef<boolean>(false)
  const detectorRef = React.useRef<any>(null)
  const landmarkerRef = React.useRef<any>(null)
  const rafRef = React.useRef<number | null>(null)

  // Overlay transform state
  const [position, setPosition] = React.useState<Point>({ x: 120, y: 120 })
  const [scale] = React.useState(1.1)
  const [rotation] = React.useState(0)

  // Smoothing refs for auto-follow
  const smoothPosRef = React.useRef<Point>({ x: 120, y: 120 })
  const smoothScaleRef = React.useRef<number>(1.1)
  const smoothRotRef = React.useRef<number>(0)
  const smoothWidthRef = React.useRef<number>(352)

  // Heuristics for overlay fitting
  const overlayAspectApprox = 0.38 // approximate height/width of the glasses overlay
  const baseWidthMultiplier = 2.35 // base overlay width relative to eye distance
  const [sizeScale, setSizeScale] = React.useState(1.0) // user-adjustable scale factor
  const verticalOffsetRatio = 0.38 // fraction of width to raise from mid-eye level

  const isDraggingRef = React.useRef(false)
  const dragStartRef = React.useRef<Point | null>(null)
  const startPosRef = React.useRef<Point>({ x: 0, y: 0 })

  // Responsive: use a taller preview on small screens
  const [isSmallScreen, setIsSmallScreen] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mql = window.matchMedia('(max-width: 640px)')
    const update = () => setIsSmallScreen(mql.matches)
    update()
    mql.addEventListener?.('change', update)
    return () => mql.removeEventListener?.('change', update)
  }, [])

  // Performance optimization: reduce detection frequency on mobile
  const detectionIntervalRef = React.useRef<number>(0)
  const lastDetectionTimeRef = React.useRef<number>(0)

  // keep refs in sync to avoid stale closure in RAF loop
  const sizeScaleRef = React.useRef<number>(1.0)
  React.useEffect(() => {
    autoFollowRef.current = autoFollow
    sizeScaleRef.current = sizeScale
  }, [autoFollow, sizeScale])

  React.useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startCamera() {
    setError(null)
    setIsStarting(true)
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: isFrontCamera ? 'user' : 'environment',
        width: { ideal: isSmallScreen ? 640 : 1280 },
        height: { ideal: isSmallScreen ? 480 : 720 },
      },
    }
    // Acquire camera only — show error ONLY if this step fails
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch {
          // Some browsers may defer play; ignore if stream is present
        }
      }
    } catch {
      setError('تعذر الوصول إلى الكاميرا. الرجاء التحقق من الأذونات.')
    }

    // Initialize trackers (do not surface camera error if tracking fails)
    try {
      await initTrackers()
    } catch {
      // ignore tracker init errors; UI can still work without auto-follow
    }
    startDetectLoop()
    setIsStarting(false)
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  async function initTrackers() {
    // Prefer MediaPipe FaceLandmarker
    try {
      const vision = await import('@mediapipe/tasks-vision')
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      const originalConsoleError = console.error
      console.error = (...args: unknown[]) => {
        const first = args[0]
        if (typeof first === 'string' && first.startsWith('INFO: Created TensorFlow Lite XNNPACK delegate')) return
        // @ts-expect-error passthrough
        return originalConsoleError.apply(console, args as Parameters<typeof console.error>)
      }
      try {
        landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      } finally {
        console.error = originalConsoleError
      }
      setAutoFollow(true)
      autoFollowRef.current = true
      return
    } catch {
      // fall back to FaceDetector if available
    }

    const FaceDetectorCtor = (globalThis as any).FaceDetector
    if (FaceDetectorCtor) {
      detectorRef.current = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1, detectLandmarks: true })
      setAutoFollow(true)
    } else {
      setAutoFollow(false)
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (autoFollow) return
    isDraggingRef.current = true
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    startPosRef.current = { ...position }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (autoFollow) return
    if (!isDraggingRef.current || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setPosition({ x: startPosRef.current.x + dx, y: startPosRef.current.y + dy })
  }

  function onPointerUp(e: React.PointerEvent) {
    if (autoFollow) return
    isDraggingRef.current = false
    dragStartRef.current = null
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
  }

  function startDetectLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    const loop = async () => {
      if (!videoRef.current || !overlayRef.current || !autoFollowRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      
      // Performance optimization: throttle detection on mobile
      const now = performance.now()
      const detectionInterval = isSmallScreen ? 100 : 33 // 10fps on mobile, 30fps on desktop
      if (now - lastDetectionTimeRef.current < detectionInterval) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      lastDetectionTimeRef.current = now
      
      try {
        const container = containerRef.current
        const overlayEl = overlayRef.current
        const video = videoRef.current
        if (!container || !overlayEl || !video) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }

        const containerRect = container.getBoundingClientRect()
        const cw = containerRect.width
        const ch = containerRect.height
        const vw = video.videoWidth || cw
        const vh = video.videoHeight || ch

        // Compute object-cover mapping
        const scaleCover = Math.max(cw / vw, ch / vh)
        const displayedW = vw * scaleCover
        const displayedH = vh * scaleCover
        const offsetX = (cw - displayedW) / 2
        const offsetY = (ch - displayedH) / 2

        let targetX = smoothPosRef.current.x
        let targetY = smoothPosRef.current.y
        let targetScale = smoothScaleRef.current
        let targetRot = smoothRotRef.current

        if (landmarkerRef.current) {
          const results = await landmarkerRef.current.detectForVideo(video, now)
          const lm = results?.faceLandmarks?.[0]
          if (lm && lm.length) {
            // Select eye corner landmarks by indices
            // Left eye outer (36x?), we use known FaceMesh indices
            const idx = {
              leftOuter: 33,
              leftInner: 133,
              rightOuter: 362,
              rightInner: 263,
            }
            const getCoord = (i: number) => ({ x: lm[i].x * displayedW + offsetX, y: lm[i].y * displayedH + offsetY })
            const L = getCoord(idx.leftOuter)
            const Li = getCoord(idx.leftInner)
            const R = getCoord(idx.rightOuter)
            const Ri = getCoord(idx.rightInner)
            const leftCenter = { x: (L.x + Li.x) / 2, y: (L.y + Li.y) / 2 }
            const rightCenter = { x: (R.x + Ri.x) / 2, y: (R.y + Ri.y) / 2 }

            const mid = { x: (leftCenter.x + rightCenter.x) / 2, y: (leftCenter.y + rightCenter.y) / 2 }
            const eyeDist = Math.hypot(rightCenter.x - leftCenter.x, rightCenter.y - leftCenter.y)
            const angleRad = Math.atan2(rightCenter.y - leftCenter.y, rightCenter.x - leftCenter.x)

            // Map to overlay transform: width scaled relative to eye distance
            const desiredOverlayWidth = eyeDist * baseWidthMultiplier * sizeScaleRef.current
            targetScale = desiredOverlayWidth / 320
            targetRot = (angleRad * 180) / Math.PI
            targetX = mid.x - (desiredOverlayWidth / 2)
            targetY = mid.y - (desiredOverlayWidth * verticalOffsetRatio)

            // Mirror compensation for front camera (since video is visual-mirrored)
            // Container is mirrored for front camera, so no further X flip needed

            // Clamp inside container bounds based on overlay size
            const overlayHeight = desiredOverlayWidth * overlayAspectApprox
            const maxX = cw - desiredOverlayWidth
            const maxY = ch - overlayHeight
            targetX = Math.max(0, Math.min(targetX, maxX))
            targetY = Math.max(0, Math.min(targetY, maxY))
          }
        } else if (detectorRef.current) {
          const faces = await detectorRef.current.detect(video)
          if (faces && faces.length > 0) {
            const box = faces[0].boundingBox
            const faceWidth = box.width * scaleCover
            let w = faceWidth * 1.35 * sizeScaleRef.current
            let x = offsetX + box.x * scaleCover + (box.width * scaleCover) / 2 - w / 2
            let y = offsetY + box.y * scaleCover + (box.height * scaleCover) * 0.08
            // Container is mirrored for front camera, so no X flip here
            targetX = x
            targetY = y
            targetScale = w / 320
            targetRot = 0
          }
        }

        // Exponential smoothing - more aggressive on mobile for better performance
        const posAlpha = isSmallScreen ? 0.4 : 0.3
        const scaleAlpha = isSmallScreen ? 0.3 : 0.2
        const rotAlpha = isSmallScreen ? 0.4 : 0.35
        const sx = smoothPosRef.current.x * (1 - posAlpha) + targetX * posAlpha
        const sy = smoothPosRef.current.y * (1 - posAlpha) + targetY * posAlpha
        const ss = smoothScaleRef.current * (1 - scaleAlpha) + targetScale * scaleAlpha
        const sr = smoothRotRef.current * (1 - rotAlpha) + targetRot * rotAlpha
        smoothPosRef.current = { x: sx, y: sy }
        smoothScaleRef.current = ss
        smoothRotRef.current = sr

        // During auto-follow, size by width and rotate around top-left to avoid drift
        const overlayWidth = ss * 320
        overlayEl.style.width = `${overlayWidth}px`
        overlayEl.style.transform = `translate(${sx}px, ${sy}px) rotate(${sr}deg)`
        overlayEl.style.transformOrigin = 'top left'
      } catch {
        // ignore detection errors per frame
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="px-3 text-sm text-red-600">{error}</div>
      )}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-md border bg-black"
        style={{ 
          aspectRatio: isSmallScreen ? '9 / 16' : '16 / 9', 
          transform: isFrontCamera ? 'scaleX(-1)' as any : undefined,
          minHeight: isSmallScreen ? '400px' : undefined,
          maxHeight: isSmallScreen ? '60vh' : undefined
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Draggable overlay */}
        <div
          role="img"
          aria-label="glasses-overlay"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          ref={overlayRef}
          className="absolute left-0 top-0 cursor-move touch-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {overlayImageUrl && overlayImageUrl.trim() !== '' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overlayImageUrl}
              alt="glasses"
              className="pointer-events-none"
              style={{ width: 320, height: 'auto', opacity: 0.92 }}
            />
          ) : (
            <svg width="320" height="120" viewBox="0 0 320 120">
              <defs>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.35" />
                </filter>
              </defs>
              <g filter="url(#shadow)" opacity="0.9">
                <rect x="10" y="40" rx="18" ry="18" width="120" height="60" fill="rgba(0,0,0,0.6)" />
                <rect x="190" y="40" rx="18" ry="18" width="120" height="60" fill="rgba(0,0,0,0.6)" />
                <rect x="130" y="62" width="60" height="10" fill="rgba(0,0,0,0.6)" />
                <circle cx="70" cy="70" r="25" fill="transparent" />
                <circle cx="250" cy="70" r="25" fill="transparent" />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Glasses size controls */}
      <div className="flex flex-col gap-2 px-2">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSizeScale(Math.min(2.0, sizeScale + 0.2))}
            className="h-12 w-12 p-0 bg-orange-600 hover:bg-orange-700 hover:text-white text-white border-orange-600 disabled:bg-gray-400 disabled:border-gray-400"
            disabled={sizeScale >= 2.0}
          >
            +
          </Button>
          <div className="text-center min-w-[60px]">
            <div className="text-sm font-medium">{Math.round(sizeScale * 100)}%</div>
            <div className="text-xs text-muted-foreground">حجم النظارات</div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSizeScale(Math.max(0.5, sizeScale - 0.2))}
            className="h-12 w-12 p-0 bg-orange-600 hover:bg-orange-700 hover:text-white text-white border-orange-600 disabled:bg-gray-400 disabled:border-gray-400"
            disabled={sizeScale <= 0.5}
          >
            −
          </Button>
        </div>
      </div>
    </div>
  )
}


