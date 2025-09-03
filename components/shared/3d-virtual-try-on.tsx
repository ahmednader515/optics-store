'use client'

import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Vector3, Euler, Quaternion, BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, Box3 } from 'three'
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
  landmarks?: Point[] // Full face mesh landmarks for occlusion
}

interface Model3DProps {
  modelUrl: string
  faceData: FaceTrackingData | null
  calibration: {
    scale: number
    offsetX: number
    offsetY: number
    offsetZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }
}

// Face mesh component for occlusion
function FaceMesh({ faceData }: { faceData: FaceTrackingData | null }) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (meshRef.current && faceData?.landmarks) {
      const mesh = meshRef.current
      const geometry = mesh.geometry as BufferGeometry
      
      // Update face mesh vertices based on landmarks
      const positions = geometry.attributes.position
      if (positions && faceData.landmarks.length >= positions.count) {
        for (let i = 0; i < positions.count; i++) {
          const landmark = faceData.landmarks[i]
          if (landmark) {
            // Convert screen coordinates to 3D world coordinates
            const worldX = (landmark.x - 0.5) * 10
            const worldY = -(landmark.y - 0.5) * 10
            const worldZ = 0.1 // Slightly in front of the glasses
            
            positions.setXYZ(i, worldX, worldY, worldZ)
          }
        }
        positions.needsUpdate = true
        geometry.computeVertexNormals()
      }
    }
  })

  if (!faceData?.landmarks) return null

  // Create a simple face mesh geometry
  const geometry = new BufferGeometry()
  const vertices = new Float32Array(faceData.landmarks.length * 3)
  const indices: number[] = []
  
  // Create vertices from landmarks
  faceData.landmarks.forEach((landmark, i) => {
    vertices[i * 3] = (landmark.x - 0.5) * 10
    vertices[i * 3 + 1] = -(landmark.y - 0.5) * 10
    vertices[i * 3 + 2] = 0.1
  })

  // Create simple triangulation (this is a simplified version)
  for (let i = 0; i < faceData.landmarks.length - 2; i++) {
    indices.push(i, i + 1, i + 2)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial 
        color="#ff0000" 
        transparent 
        opacity={0.3}
        side={2} // DoubleSide
      />
    </mesh>
  )
}

function Model3D({ modelUrl, faceData, calibration }: Model3DProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(modelUrl)
  const { viewport, camera } = useThree()
  const modelWidthRef = useRef<number>(1)
  const centeredRef = useRef(false)
  const targetQuat = useRef(new Quaternion())

  // Center model around origin and capture its width so scaling is relative to actual model size
  useEffect(() => {
    try {
      if (scene && !centeredRef.current) {
        scene.updateMatrixWorld(true)
        const box = new Box3().setFromObject(scene)
        const center = new Vector3()
        const size = new Vector3()
        box.getCenter(center)
        box.getSize(size)
        modelWidthRef.current = Math.max(0.001, size.x)
        scene.position.sub(center) // recentre so origin approximates the bridge
        centeredRef.current = true
      }
    } catch {}
  }, [scene])

  useFrame(() => {
    if (groupRef.current && faceData) {
      const group = groupRef.current

      // Calculate position based on eye positions (normalized 0..1)
      const eyeCenter = {
        x: (faceData.leftEye.x + faceData.rightEye.x) / 2,
        y: (faceData.leftEye.y + faceData.rightEye.y) / 2
      }

      // Map normalized coords into world units using current viewport at z=0
      const vpWidth = (viewport as any).width || 10
      const vpHeight = (viewport as any).height || 10
      // Map X directly; the overlay is already mirrored via CSS
      const worldX = (eyeCenter.x - 0.5) * vpWidth
      const worldY = -(eyeCenter.y - 0.5) * vpHeight
      const worldZ = 0

      // Heuristic default offsets to better align bridge with eye center
      const defaultXOffset = 0.02 * vpWidth // nudge slightly left for better centering
      const defaultYOffset = -0.03 * vpHeight // slightly down towards the nose
      const defaultZOffset = 0

      const target = new Vector3(
        worldX + defaultXOffset + (calibration.offsetX ?? 0),
        worldY + (calibration.offsetY ?? 0) + defaultYOffset,
        worldZ + (calibration.offsetZ ?? 0) + defaultZOffset
      )

      // Smooth damp movement for stability
      const lerpAlpha = 0.35
      group.position.lerp(target, lerpAlpha)
      
      // Apply face rotation + calibration rotation
      // Amplify yaw/pitch for stronger parallax and invert roll for mirrored preview
      const yawGain = 2.2
      const pitchGain = 1.4
      const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v))
      const pitchDeg = clamp(faceData.rotation.pitch * pitchGain + calibration.rotationX, -30, 30)
      const yawDeg = clamp(faceData.rotation.yaw * yawGain + calibration.rotationY, -45, 45)
      const rollDeg = clamp(-(faceData.rotation.roll) + calibration.rotationZ, -45, 45)
      const faceRotation = new Euler(
        pitchDeg * Math.PI / 180,
        yawDeg * Math.PI / 180,
        rollDeg * Math.PI / 180,
        'YXZ'
      )
      targetQuat.current.setFromEuler(faceRotation)
      group.quaternion.slerp(targetQuat.current, lerpAlpha)
      
      // Apply scale based on eye distance and calibration
      const eyeDistance = Math.hypot(
        faceData.rightEye.x - faceData.leftEye.x,
        faceData.rightEye.y - faceData.leftEye.y
      )
      // Convert normalized eye distance into world units using viewport width
      const eyeDistanceWorld = eyeDistance * vpWidth
      // Heuristic factor: typical glasses width (temple to temple) relative to eye distance
      const baseScale = (eyeDistanceWorld * 1.8) / modelWidthRef.current
      const targetScale = Math.max(0.001, baseScale * (calibration.scale || 1))
      const currentScale = group.scale.x
      const nextScale = currentScale + (targetScale - currentScale) * lerpAlpha
      group.scale.setScalar(nextScale)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

interface VirtualTryOn3DProps {
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

export default function VirtualTryOn3D({ 
  modelUrl, 
  calibration, 
  onClose 
}: VirtualTryOn3DProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(true)
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null)
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  const landmarkerRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const lastFrameTime = useRef<number>(0)
  const frameSkip = useRef<number>(0)

  // Suppress noisy Mediapipe INFO logs that use console.error and trigger Next overlay
  useEffect(() => {
    const originalError = console.error
    console.error = (...args: any[]) => {
      try {
        const first = args[0]
        if (typeof first === 'string' && (first.includes('XNNPACK delegate') || first.startsWith('INFO:'))) {
          return
        }
      } catch {}
      return (originalError as any).apply(console, args)
    }
    return () => {
      console.error = originalError
    }
  }, [])

  // Detect device performance capabilities
  useEffect(() => {
    const detectPerformance = () => {
      // Check for mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Check for low-end devices based on hardware concurrency
      const cores = navigator.hardwareConcurrency || 2
      const isLowEnd = cores <= 2 || isMobile
      
      setIsLowPerformance(isLowEnd)
    }

    detectPerformance()
  }, [])

  // Initialize MediaPipe face landmarker with FilesetResolver and delegate fallback
  useEffect(() => {
    const initialize = async () => {
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
        const delegate: 'CPU' | 'GPU' = !isLowPerformance && supportsWebGL && 'OffscreenCanvas' in window ? 'GPU' : 'CPU'

        const landmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
            delegate,
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: isLowPerformance ? 0.3 : 0.5,
          minFacePresenceConfidence: isLowPerformance ? 0.3 : 0.5,
          minTrackingConfidence: isLowPerformance ? 0.3 : 0.5,
        })

        landmarkerRef.current = landmarker
      } catch (err) {
        // Downgrade to warn to avoid dev overlay for non-fatal Mediapipe diagnostics
        console.warn('Failed to initialize face detection:', err)
        setError('Failed to initialize face detection')
      }
    }

    initialize()
  }, [isLowPerformance])

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

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        const video = videoRef.current
        video.srcObject = stream
        // Wait for metadata so width/height are available
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded)
            resolve()
          }
          video.addEventListener('loadedmetadata', onLoaded)
        })
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
      if (!videoRef.current || !landmarkerRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const video = videoRef.current
      const now = performance.now()
      if (video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // Frame rate limiting for low-performance devices
      if (isLowPerformance) {
        const targetFPS = 15 // Limit to 15 FPS on low-end devices
        const frameInterval = 1000 / targetFPS
        
        if (now - lastFrameTime.current < frameInterval) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }
        
        // Skip every other frame on very low-end devices
        frameSkip.current++
        if (frameSkip.current % 2 === 0) {
          rafRef.current = requestAnimationFrame(loop)
          return
        }
        
        lastFrameTime.current = now
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

          // Convert all landmarks to Point format for occlusion
          const allLandmarks = landmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y
          }))

          setFaceData({
            leftEye,
            rightEye,
            nose,
            rotation: { yaw, pitch, roll },
            scale,
            landmarks: allLandmarks
          })
        } else {
          setFaceData(null)
        }
      } catch (err) {
        // Ignore non-fatal Mediapipe diagnostics
        console.warn('Face detection warning:', err)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  const toggleCamera = () => {
    stopCamera()
    setIsFrontCamera(!isFrontCamera)
  }

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

        {/* 3D Canvas Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: isFrontCamera ? 'scaleX(-1)' as any : undefined }}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Suspense fallback={null}>
              <Model3D
                modelUrl={modelUrl}
                faceData={faceData}
                calibration={calibration}
              />
              {/* Face mesh for occlusion (optional - can be toggled for debugging) */}
              {/* <FaceMesh faceData={faceData} /> */}
            </Suspense>
          </Canvas>
        </div>

        {/* Face tracking indicator */}
        {faceData && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
            وجه مكتشف
          </div>
        )}

        {/* Performance indicator */}
        {isLowPerformance && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
            وضع توفير الطاقة
          </div>
        )}
      </div>
    </div>
  )
}
