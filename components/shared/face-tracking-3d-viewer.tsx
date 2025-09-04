'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// Using browser's built-in face detection instead of MediaPipe

interface FaceTrackingData {
  leftEye: { x: number; y: number }
  rightEye: { x: number; y: number }
  nose: { x: number; y: number }
  rotation: { yaw: number; pitch: number; roll: number }
  scale: number
  landmarks?: Array<{ x: number; y: number }>
}

interface FaceTracking3DViewerProps {
  modelUrl?: string
  scale?: number
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  rotationX?: number
  rotationY?: number
  rotationZ?: number
  onCalibrationChange?: (calibration: {
    scale: number
    offsetX: number
    offsetY: number
    offsetZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }) => void
  onFaceDataChange?: (faceData: FaceTrackingData | null) => void
}

export default function FaceTracking3DViewer({
  modelUrl,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  onCalibrationChange,
  onFaceDataChange
}: FaceTracking3DViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const faceDetectionRef = useRef<FaceDetector | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  
  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)
  const backgroundPlaneRef = useRef<THREE.Mesh | null>(null)

  // Fit background plane to viewport while preserving video aspect ratio
  const updateBackgroundPlaneSize = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !backgroundPlaneRef.current) return
    const renderer = rendererRef.current
    const camera = cameraRef.current
    const plane = backgroundPlaneRef.current

    const viewportWidth = renderer.domElement.clientWidth
    const viewportHeight = Math.max(renderer.domElement.clientHeight, 1)
    const viewportAspect = viewportWidth / viewportHeight

    // Default to 4:3 if video metadata not ready yet
    const videoW = videoRef.current?.videoWidth || 640
    const videoH = videoRef.current?.videoHeight || 480
    const videoAspect = videoW / Math.max(videoH, 1)

    const cameraZ = camera.position.z
    const planeZ = plane.position.z
    const distance = cameraZ - planeZ
    const vFov = (camera.fov * Math.PI) / 180
    const viewportHeightWorld = 2 * Math.tan(vFov / 2) * distance
    const viewportWidthWorld = viewportHeightWorld * viewportAspect

    // Cover viewport without stretching (preserve video aspect)
    let planeHeightWorld = viewportHeightWorld
    let planeWidthWorld = planeHeightWorld * videoAspect
    if (planeWidthWorld < viewportWidthWorld) {
      planeWidthWorld = viewportWidthWorld
      planeHeightWorld = planeWidthWorld / videoAspect
    }

    plane.scale.set(planeWidthWorld, planeHeightWorld, 1)
    plane.position.x = 0
    plane.position.y = 0
  }, [])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null)

  // Create video texture background
  const createVideoTexture = useCallback(() => {
    if (!videoRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return

    // Create video texture
    const videoTexture = new THREE.VideoTexture(videoRef.current)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    // Mirror like a selfie camera
    videoTexture.wrapS = THREE.RepeatWrapping
    videoTexture.repeat.x = -1
    videoTexture.offset.x = 1
    videoTextureRef.current = videoTexture

    // Create background plane sized to fill viewport
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide })
    const backgroundPlane = new THREE.Mesh(geometry, material)
    backgroundPlane.position.z = -1 // Slightly behind origin
    backgroundPlaneRef.current = backgroundPlane
    sceneRef.current.add(backgroundPlane)

    // Fit plane size initially
    updateBackgroundPlaneSize()
  }, [])

  // Load 3D model
  const load3DModel = useCallback(() => {
    if (!modelUrl || !sceneRef.current) {
      setIsLoading(false)
      return
    }

    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene
        model.scale.set(scale, scale, scale)
        model.position.set(offsetX, offsetY, offsetZ)
        model.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        )
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        
        sceneRef.current?.add(model)
        modelRef.current = model
        setIsLoading(false)
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error)
        setError('Failed to load 3D model')
        setIsLoading(false)
      }
    )
  }, [modelUrl, scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ])

  // Initialize face detection
  const initializeFaceDetection = useCallback(async () => {
    try {
      // Check if FaceDetector is available
      if (!('FaceDetector' in window)) {
        console.warn('FaceDetector not supported, using fallback')
        return
      }

      const faceDetector = new (window as any).FaceDetector({
        maxDetectedFaces: 1,
        fastMode: true
      })

      faceDetectionRef.current = faceDetector
    } catch (err) {
      console.error('Error initializing face detection:', err)
      setError('Failed to initialize face tracking')
    }
  }, [])

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      
      videoRef.current.srcObject = stream
      videoRef.current.play()
      streamRef.current = stream
      setIsCameraActive(true)

      // Create video texture when video is ready
      videoRef.current.addEventListener('loadeddata', () => {
        createVideoTexture()
      })

      // Start face detection and rendering loop
      const detectAndRender = async () => {
        if (!videoRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return

        // Detect faces if available
        if (faceDetectionRef.current) {
          try {
            const faces = await faceDetectionRef.current.detect(videoRef.current)
            
            if (faces.length > 0) {
              const face = faces[0]
              const boundingBox = face.boundingBox
              
              // Calculate eye positions
              const leftEyeX = boundingBox.x + boundingBox.width * 0.3
              const rightEyeX = boundingBox.x + boundingBox.width * 0.7
              const eyeY = boundingBox.y + boundingBox.height * 0.4
              const noseX = boundingBox.x + boundingBox.width * 0.5
              const noseY = boundingBox.y + boundingBox.height * 0.6
              
              // Normalize coordinates
              const leftEye = { 
                x: leftEyeX / videoRef.current.videoWidth, 
                y: eyeY / videoRef.current.videoHeight 
              }
              const rightEye = { 
                x: rightEyeX / videoRef.current.videoWidth, 
                y: eyeY / videoRef.current.videoHeight 
              }
              const nose = { 
                x: noseX / videoRef.current.videoWidth, 
                y: noseY / videoRef.current.videoHeight 
              }
              
              // Calculate face rotation
              const eyeDistance = Math.sqrt(
                Math.pow(rightEye.x - leftEye.x, 2) + 
                Math.pow(rightEye.y - leftEye.y, 2)
              )
              
              const faceScale = eyeDistance * 2
              const yaw = Math.atan2(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * (180 / Math.PI)
              const pitch = Math.atan2(nose.y - eyeY, 0.1) * (180 / Math.PI)
              const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI)
              
              const newFaceData: FaceTrackingData = {
                leftEye,
                rightEye,
                nose,
                rotation: { yaw, pitch, roll },
                scale: faceScale,
                landmarks: []
              }
              
              setFaceData(newFaceData)
              onFaceDataChange?.(newFaceData)

              // Update 3D model position based on face tracking
              if (modelRef.current) {
                // Position glasses on the eyes
                const eyeCenterX = (leftEye.x + rightEye.x) / 2
                const eyeCenterY = (leftEye.y + rightEye.y) / 2
                
                // Convert screen coordinates to 3D world coordinates
                const worldX = (eyeCenterX - 0.5) * 4 // Scale and center
                const worldY = -(eyeCenterY - 0.5) * 3 // Scale, center, and flip Y
                
                // Apply face tracking position
                modelRef.current.position.set(
                  worldX + offsetX,
                  worldY + offsetY,
                  offsetZ
                )
                
                // Apply face tracking rotation
                modelRef.current.rotation.set(
                  ((rotationX + newFaceData.rotation.pitch) * Math.PI) / 180,
                  ((rotationY + newFaceData.rotation.yaw) * Math.PI) / 180,
                  ((rotationZ + newFaceData.rotation.roll) * Math.PI) / 180
                )
                
                // Apply face tracking scale
                const faceScale = newFaceData.scale * scale
                modelRef.current.scale.set(faceScale, faceScale, faceScale)
              }
            } else {
              setFaceData(null)
              onFaceDataChange?.(null)
            }
          } catch (err) {
            console.error('Face detection error:', err)
          }
        }
        
        // Render the 3D scene
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        
        // Continue rendering loop
        if (isCameraActive) {
          animationRef.current = requestAnimationFrame(detectAndRender)
        }
      }
      
      // Start detection after video is ready
      videoRef.current.addEventListener('loadeddata', () => {
        updateBackgroundPlaneSize()
        detectAndRender()
      })
      
    } catch (err) {
      console.error('Error starting camera:', err)
      setError('Failed to start camera')
    }
  }, [isCameraActive, onFaceDataChange, scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }, [])

  // Initialize 3D scene
  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 5)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Load 3D model
    load3DModel()

    // Initialize face detection
    initializeFaceDetection()

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return
      
      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      // Fit background plane to new viewport preserving aspect
      updateBackgroundPlaneSize()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      stopCamera()
      if (renderer) {
        renderer.dispose()
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose()
      }
    }
  }, [load3DModel, initializeFaceDetection, stopCamera, createVideoTexture, updateBackgroundPlaneSize])

  // Start camera automatically
  useEffect(() => {
    if (isLoading) return
    
    const timer = setTimeout(() => {
      startCamera()
    }, 1000) // Start camera 1 second after component loads

    return () => clearTimeout(timer)
  }, [isLoading, startCamera])

  // Notify parent of calibration changes
  useEffect(() => {
    if (onCalibrationChange) {
      onCalibrationChange({
        scale,
        offsetX,
        offsetY,
        offsetZ,
        rotationX,
        rotationY,
        rotationZ
      })
    }
  }, [scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ, onCalibrationChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (error) {
    return (
      <div className="w-full h-64 border rounded-lg bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading virtual try-on</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {/* Video element for face tracking (hidden) */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-0 pointer-events-none"
        playsInline
        muted
      />
      
      {/* Canvas for 3D model rendering with video background */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Camera status indicator */}
      <div className="absolute top-2 right-2 z-20">
        <div className={`px-2 py-1 rounded text-xs ${
          isCameraActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isCameraActive ? 'Camera Active' : 'Starting Camera...'}
        </div>
      </div>
      
      {/* Face tracking status */}
      {faceData && (
        <div className="absolute bottom-2 left-2 z-20">
          <div className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
            Face Detected
          </div>
        </div>
      )}
    </div>
  )
}
