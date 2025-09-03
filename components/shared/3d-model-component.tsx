'use client'

import React, { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group } from 'three'

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
  const groupRef = useRef<Group>(null)
  
  if (!modelUrl) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Model3DContent
        modelUrl={modelUrl}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
        offsetZ={offsetZ}
        rotationX={rotationX}
        rotationY={rotationY}
        rotationZ={rotationZ}
        groupRef={groupRef}
      />
    </Suspense>
  )
}

function Model3DContent({
  modelUrl,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  groupRef
}: Model3DProps & { groupRef: React.RefObject<Group> }) {
  if (!modelUrl) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
    )
  }

  const { scene } = useGLTF(modelUrl)
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = (rotationX * Math.PI) / 180
      groupRef.current.rotation.y = (rotationY * Math.PI) / 180
      groupRef.current.rotation.z = (rotationZ * Math.PI) / 180
    }
  })

  return (
    <group ref={groupRef} position={[offsetX, offsetY, offsetZ]} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  )
}

export function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ccc" wireframe />
    </mesh>
  )
}
