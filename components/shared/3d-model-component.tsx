'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface Model3DProps {
  modelUrl?: string
  scale?: number
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  rotationX?: number
  rotationY?: number
  rotationZ?: number
}

export function Model3D({ 
  modelUrl, 
  scale = 1, 
  offsetX = 0, 
  offsetY = 0, 
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0
}: Model3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    if (modelUrl) {
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
          
          scene.add(model)
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
    } else {
      // Create a placeholder cube
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({ color: 0x666666, wireframe: true })
      const cube = new THREE.Mesh(geometry, material)
      scene.add(cube)
      modelRef.current = cube
      setIsLoading(false)
    }

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return
      
      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      if (modelRef.current) {
        modelRef.current.rotation.x = (rotationX * Math.PI) / 180
        modelRef.current.rotation.y = (rotationY * Math.PI) / 180
        modelRef.current.rotation.z = (rotationZ * Math.PI) / 180
        modelRef.current.position.set(offsetX, offsetY, offsetZ)
        modelRef.current.scale.set(scale, scale, scale)
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (renderer) {
        renderer.dispose()
      }
    }
  }, [modelUrl, scale, offsetX, offsetY, offsetZ, rotationX, rotationY, rotationZ])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading 3D model</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

export function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
