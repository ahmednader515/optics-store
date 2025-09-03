'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw } from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface FaceTrackingData {
  leftEye: Point
  rightEye: Point
  nose: Point
  rotation: {
    yaw: number
    pitch: number
    roll: number
  }
  scale: number
}

interface Simple3DTryOnProps {
  modelUrl: string
  calibration: {
    scale: number
    offsetX: number
    offsetY: number
    offsetZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }
  onClose: () => void
}

export default function Simple3DTryOn({ 
  modelUrl, 
  calibration, 
  onClose 
}: Simple3DTryOnProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(true)
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null)

  const detectorRef = useRef<any>(null)
  const landmarkerRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)

  // Lazy initialize MediaPipe tasks when needed (avoids GPU/OffscreenCanvas issues during SSR or idle)
  const ensureVisionInitialized = async () => {
    if (detectorRef.current && landmarkerRef.current) return
    try {
      const vision = await import('@mediapipe/tasks-vision')
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      const supportsWebGL = (() => {
        try {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        } catch {
          return false
        }
      })()
      const delegate: 'CPU' | 'GPU' = supportsWebGL && 'OffscreenCanvas' in window ? 'GPU' : 'CPU'

      const landmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          delegate,
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      landmarkerRef.current = landmarker
    } catch (err) {
      console.error('Failed to initialize face detection:', err)
      setError('Failed to initialize face detection')
      throw err
    }
  }

  const startCamera = async () => {
    try {
      setIsStarting(true)
      setError(null)

      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }

      await ensureVisionInitialized()

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        const video = videoRef.current
        video.srcObject = stream
        // Ensure metadata is loaded to have dimensions
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded)
            resolve()
          }
          video.addEventListener('loadedmetadata', onLoaded)
        })

        // Set canvas internal size to match the video for crisp drawing
        if (canvasRef.current) {
          const v = video
          canvasRef.current.width = v.videoWidth || 640
          canvasRef.current.height = v.videoHeight || 480
        }

        await video.play()
      }

      startDetectLoop()
    } catch (err) {
      console.error('Camera error:', err)
      setError('Failed to access camera')
    } finally {
      setIsStarting(false)
    }
  }

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const startDetectLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    const loop = async () => {
      if (!videoRef.current || !landmarkerRef.current || !detectorRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const video = videoRef.current
      const now = performance.now()

      // Ensure video is ready
      if (video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      try {
        const results = await landmarkerRef.current.detectForVideo(video, now)
        const landmarks = results?.faceLandmarks?.[0]

        if (landmarks && landmarks.length > 0) {
          // Extract key facial landmarks
          const leftEye = {
            x: landmarks[33].x,
            y: landmarks[33].y
          }
          const rightEye = {
            x: landmarks[362].x,
            y: landmarks[362].y
          }
          const nose = {
            x: landmarks[1].x,
            y: landmarks[1].y
          }

          // Calculate rotation from landmarks
          const eyeVector = {
            x: rightEye.x - leftEye.x,
            y: rightEye.y - leftEye.y
          }
          const roll = Math.atan2(eyeVector.y, eyeVector.x) * 180 / Math.PI

          // Estimate yaw and pitch (simplified)
          const noseOffset = {
            x: nose.x - (leftEye.x + rightEye.x) / 2,
            y: nose.y - (leftEye.y + rightEye.y) / 2
          }
          const yaw = noseOffset.x * 30 // Rough estimation
          const pitch = noseOffset.y * 20 // Rough estimation

          // Calculate scale based on eye distance
          const eyeDistance = Math.hypot(eyeVector.x, eyeVector.y)
          const scale = eyeDistance

          setFaceData({
            leftEye,
            rightEye,
            nose,
            rotation: { yaw, pitch, roll },
            scale
          })
        } else {
          setFaceData(null)
        }
      } catch (err) {
        console.error('Face detection error:', err)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  const toggleCamera = () => {
    stopCamera()
    setIsFrontCamera(!isFrontCamera)
  }

  // Draw simple 3D representation on canvas
  useEffect(() => {
    if (!canvasRef.current || !faceData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate position based on eye positions
    const eyeCenter = {
      x: (faceData.leftEye.x + faceData.rightEye.x) / 2,
      y: (faceData.leftEye.y + faceData.rightEye.y) / 2
    }

    // Convert to canvas coordinates
    const canvasX = eyeCenter.x * canvas.width
    const canvasY = eyeCenter.y * canvas.height

    // Draw a simple glasses representation
    const eyeDistance = Math.hypot(
      (faceData.rightEye.x - faceData.leftEye.x) * canvas.width,
      (faceData.rightEye.y - faceData.leftEye.y) * canvas.height
    )

    const glassesWidth = eyeDistance * 1.5 * calibration.scale
    const glassesHeight = glassesWidth * 0.3

    // Apply calibration offsets
    const offsetX = calibration.offsetX * 50
    const offsetY = calibration.offsetY * 50

    // Draw glasses frame
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 3
    ctx.beginPath()

    // Left lens
    ctx.ellipse(
      canvasX - glassesWidth / 2 + offsetX,
      canvasY + offsetY,
      glassesWidth / 4,
      glassesHeight / 2,
      (faceData.rotation.roll + calibration.rotationZ) * Math.PI / 180,
      0,
      2 * Math.PI
    )

    // Right lens
    ctx.ellipse(
      canvasX + glassesWidth / 2 + offsetX,
      canvasY + offsetY,
      glassesWidth / 4,
      glassesHeight / 2,
      (faceData.rotation.roll + calibration.rotationZ) * Math.PI / 180,
      0,
      2 * Math.PI
    )

    // Bridge
    ctx.moveTo(canvasX - glassesWidth / 4 + offsetX, canvasY + offsetY)
    ctx.lineTo(canvasX + glassesWidth / 4 + offsetX, canvasY + offsetY)

    ctx.stroke()

    // Draw temple arms (simplified)
    ctx.beginPath()
    ctx.moveTo(canvasX - glassesWidth / 2 + offsetX, canvasY + offsetY)
    ctx.lineTo(canvasX - glassesWidth / 2 - 30 + offsetX, canvasY + offsetY)
    ctx.moveTo(canvasX + glassesWidth / 2 + offsetX, canvasY + offsetY)
    ctx.lineTo(canvasX + glassesWidth / 2 + 30 + offsetX, canvasY + offsetY)
    ctx.stroke()

  }, [faceData, calibration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            onClick={isStarting ? undefined : startCamera}
            disabled={isStarting}
            size="sm"
            className="flex items-center gap-2"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                بدء الكاميرا
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                بدء الكاميرا
              </>
            )}
          </Button>
          
          <Button
            onClick={stopCamera}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CameraOff className="w-4 h-4" />
            إيقاف
          </Button>

          <Button
            onClick={toggleCamera}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            تبديل الكاميرا
          </Button>
        </div>

        <Button onClick={onClose} variant="outline" size="sm">
          إغلاق
        </Button>
      </div>

      {/* Camera and 3D View */}
      <div className="relative w-full h-[480px]">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          playsInline
          autoPlay
          muted
          style={{ transform: isFrontCamera ? 'scaleX(-1)' as any : undefined }}
        />

        {/* Simple 3D Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ background: 'transparent' }}
          // Mirror overlay to match mirrored video when front camera
          data-mirror={isFrontCamera ? 'true' : 'false'}
          style={{ background: 'transparent', transform: isFrontCamera ? 'scaleX(-1)' as any : undefined }}
        />

        {/* Face tracking indicator */}
        {faceData && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
            وجه مكتشف
          </div>
        )}

        {/* Simple 3D indicator */}
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          معاينة مبسطة
        </div>
      </div>
    </div>
  )
}
