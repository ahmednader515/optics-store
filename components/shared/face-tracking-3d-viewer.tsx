"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

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
  fitMultiplier?: number
  eyeLift?: number
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
  fitMultiplier = 2.25,
  eyeLift = -0.25,
  onCalibrationChange,
  onFaceDataChange,
}: FaceTracking3DViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const landmarkerRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  // Three.js
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)
  const backgroundPlaneRef = useRef<THREE.Mesh | null>(null)
  const baseModelWidthRef = useRef<number>(1)
  const baseModelHeightRef = useRef<number>(1)
  const faceOccluderRef = useRef<THREE.Mesh | null>(null)

  // smoothing
  const smoothPos = useRef({ x: 0, y: 0 })
  const smoothRot = useRef({ x: 0, y: 0, z: 0 })
  const smoothScale = useRef(scale)
  const lastTs = useRef<number>(performance.now())

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null)

  /** Fit background plane to viewport */
  const updateBackgroundPlaneSize = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !backgroundPlaneRef.current) return
    const renderer = rendererRef.current
    const camera = cameraRef.current
    const plane = backgroundPlaneRef.current

    const vw = renderer.domElement.clientWidth
    const vh = renderer.domElement.clientHeight
    const aspect = vw / vh

    const vidW = videoRef.current?.videoWidth || 640
    const vidH = videoRef.current?.videoHeight || 480
    const vidAspect = vidW / vidH

    const dist = camera.position.z - plane.position.z
    const vFov = (camera.fov * Math.PI) / 180
    const viewH = 2 * Math.tan(vFov / 2) * dist
    const viewW = viewH * aspect

    let planeH = viewH
    let planeW = planeH * vidAspect
    if (planeW < viewW) {
      planeW = viewW
      planeH = planeW / vidAspect
    }
    plane.scale.set(planeW, planeH, 1)
  }, [])

  /** viewport world size */
  const getViewportWorldSize = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current) return { width: 4, height: 3 }
    const renderer = rendererRef.current
    const camera = cameraRef.current
    const vw = renderer.domElement.clientWidth
    const vh = renderer.domElement.clientHeight
    const aspect = vw / vh
    const dist = camera.position.z
    const vFov = (camera.fov * Math.PI) / 180
    const viewH = 2 * Math.tan(vFov / 2) * dist
    const viewW = viewH * aspect
    return { width: viewW, height: viewH }
  }, [])

  /** create video texture background */
  const createVideoTexture = useCallback(() => {
    if (!videoRef.current || !sceneRef.current) return
    const tex = new THREE.VideoTexture(videoRef.current)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.wrapS = THREE.RepeatWrapping
    tex.repeat.x = -1
    tex.offset.x = 1
    videoTextureRef.current = tex

    const geo = new THREE.PlaneGeometry(1, 1)
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    const bg = new THREE.Mesh(geo, mat)
    bg.position.z = -1
    sceneRef.current.add(bg)
    backgroundPlaneRef.current = bg
    updateBackgroundPlaneSize()
  }, [updateBackgroundPlaneSize])

  /** occluder */
  const ensureFaceOccluder = useCallback(() => {
    if (!sceneRef.current || faceOccluderRef.current) return
    const geo = new THREE.CircleGeometry(0.5, 32)
    const mat = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      depthTest: true,
      transparent: true,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.z = offsetZ + 0.01
    mesh.renderOrder = 0
    sceneRef.current.add(mesh)
    faceOccluderRef.current = mesh
  }, [offsetZ])

  /** load 3D model */
  const load3DModel = useCallback(() => {
    if (!modelUrl || !sceneRef.current) {
      setIsLoading(false)
      return
    }
    if (modelRef.current) sceneRef.current.remove(modelRef.current)
    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene
        model.scale.set(scale, scale, scale)
        model.visible = false
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        const width = box.max.x - box.min.x || 1
        baseModelWidthRef.current = width
        const height = box.max.y - box.min.y || 1
        baseModelHeightRef.current = height
        sceneRef.current?.add(model)
        modelRef.current = model
        setIsLoading(false)
      },
      undefined,
      (err) => {
        console.error("Model load error:", err)
        setError("Failed to load 3D model")
        setIsLoading(false)
      }
    )
  }, [modelUrl, scale])

  /** init mediapipe */
  const initializeFaceDetection = useCallback(async () => {
    try {
      const vision = await import("@mediapipe/tasks-vision")
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      )
      landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      })
    } catch (e) {
      console.warn("Face tracking not available", e)
    }
  }, [])

  // Suppress noisy TFLite INFO logs that are emitted via console.error by MediaPipe
  useEffect(() => {
    const originalError = console.error
    const filter = (...args: unknown[]) => {
      const first = args[0]
      if (typeof first === 'string') {
        if (first.startsWith('INFO: Created TensorFlow Lite') || first.includes('XNNPACK delegate')) {
          return
        }
      }
      return (originalError as any).apply(console, args as any)
    }
    console.error = filter as any
    return () => {
      console.error = originalError
    }
  }, [])

  /** start camera */
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
    videoRef.current.srcObject = stream
    await videoRef.current.play().catch(() => {})
    streamRef.current = stream
    setIsCameraActive(true)
    videoRef.current.addEventListener("loadeddata", () => {
      createVideoTexture()
    })

    const detectAndRender = async () => {
      if (!videoRef.current || !landmarkerRef.current || !sceneRef.current || !rendererRef.current || !cameraRef.current) {
        if (isCameraActive) animationRef.current = requestAnimationFrame(detectAndRender)
        return
      }
      const video = videoRef.current
      const now = performance.now()
      const results = await landmarkerRef.current.detectForVideo(video, now)
      const lm = results?.faceLandmarks?.[0]
      if (lm) {
        const L_OUT = 33,
          L_IN = 133,
          R_OUT = 362,
          R_IN = 263,
          NOSE = 1
        const lOut = lm[L_OUT],
          lIn = lm[L_IN],
          rOut = lm[R_OUT],
          rIn = lm[R_IN],
          noseLm = lm[NOSE]
        const left = { x: (lOut.x + lIn.x) / 2, y: (lOut.y + lIn.y) / 2, z: (lOut.z + lIn.z) / 2 }
        const right = { x: (rOut.x + rIn.x) / 2, y: (rOut.y + rIn.y) / 2, z: (rOut.z + rIn.z) / 2 }
        const mid = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2, z: (left.z + right.z) / 2 }
        const roll = Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI)
        const yaw = Math.atan2(right.z - left.z, right.x - left.x) * (180 / Math.PI)
        const pitch = (noseLm.z - mid.z) * -180

        const mirroredX = 1 - mid.x
        const world = getViewportWorldSize()
        const eyeDist = Math.hypot(right.x - left.x, right.y - left.y)
        const desiredW = eyeDist * world.width * fitMultiplier
        const faceScale = desiredW / baseModelWidthRef.current

        const newFaceData: FaceTrackingData = {
          leftEye: { x: left.x, y: left.y },
          rightEye: { x: right.x, y: right.y },
          nose: { x: noseLm.x, y: noseLm.y },
          rotation: { yaw, pitch, roll },
          scale: faceScale,
        }
        setFaceData(newFaceData)
        onFaceDataChange?.(newFaceData)

        if (modelRef.current) {
          const worldX = (mirroredX - 0.5) * world.width
          const worldY = -(mid.y - 0.5) * world.height
          const dt = Math.max(0.001, (now - lastTs.current) / 1000)
          lastTs.current = now
          const alpha = 0.25
          smoothPos.current.x += (worldX + offsetX - smoothPos.current.x) * alpha
          smoothPos.current.y += (worldY + offsetY - smoothPos.current.y) * alpha
          smoothRot.current.x += (((rotationX + pitch) * Math.PI) / 180 - smoothRot.current.x) * alpha
          smoothRot.current.y += (((rotationY - yaw) * Math.PI) / 180 - smoothRot.current.y) * alpha
          // Mirror only tilting (roll) direction
          smoothRot.current.z += (((rotationZ + roll) * Math.PI) / 180 - smoothRot.current.z) * alpha
          smoothScale.current += (faceScale * scale - smoothScale.current) * alpha

          const eyeLiftWorld = -baseModelHeightRef.current * smoothScale.current * eyeLift
          modelRef.current.position.set(smoothPos.current.x, smoothPos.current.y + eyeLiftWorld, offsetZ)
          modelRef.current.rotation.set(smoothRot.current.x, smoothRot.current.y, smoothRot.current.z)
          modelRef.current.scale.set(smoothScale.current, smoothScale.current, smoothScale.current)
          modelRef.current.visible = true

          if (faceOccluderRef.current) {
            faceOccluderRef.current.position.set(smoothPos.current.x, smoothPos.current.y, offsetZ + 0.01)
            faceOccluderRef.current.scale.set(desiredW * 0.8, desiredW * 0.9, 1)
          }
        }
      } else {
        setFaceData(null)
        if (modelRef.current) modelRef.current.visible = false
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      if (isCameraActive) animationRef.current = requestAnimationFrame(detectAndRender)
    }

    videoRef.current.addEventListener("loadeddata", () => {
      updateBackgroundPlaneSize()
      detectAndRender()
    })
  }, [createVideoTexture, updateBackgroundPlaneSize, getViewportWorldSize, isCameraActive, onFaceDataChange, scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ, fitMultiplier, eyeLift])

  const stopCamera = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    setIsCameraActive(false)
  }, [])

  /** init 3D scene */
  useEffect(() => {
    if (!canvasRef.current) return
    const scene = new THREE.Scene()
    sceneRef.current = scene
    const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    rendererRef.current = renderer
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(10, 10, 5)
    scene.add(dir)
    load3DModel()
    initializeFaceDetection()
    ensureFaceOccluder()
    const resize = () => {
      if (!canvasRef.current || !camera || !renderer) return
      const w = canvasRef.current.clientWidth
      const h = canvasRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      updateBackgroundPlaneSize()
    }
    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("resize", resize)
      stopCamera()
      renderer.dispose()
      videoTextureRef.current?.dispose()
    }
  }, [load3DModel, initializeFaceDetection, ensureFaceOccluder, updateBackgroundPlaneSize, stopCamera])

  useEffect(() => {
    if (isLoading) return
    const t = setTimeout(() => startCamera(), 800)
    return () => clearTimeout(t)
  }, [isLoading, startCamera])

  useEffect(() => {
    onCalibrationChange?.({ scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ })
  }, [scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ, onCalibrationChange])

  useEffect(() => () => stopCamera(), [stopCamera])

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 border rounded-lg">
        <p className="text-red-600">{error}</p>
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
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover opacity-0" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
        {isCameraActive ? "Camera Active" : "Starting Camera..."}
      </div>
      {faceData && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Face Detected</div>
      )}
    </div>)}
