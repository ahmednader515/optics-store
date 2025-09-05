'use client'

import React, { useState } from 'react'
import FaceTracking3DViewer from './face-tracking-3d-viewer'
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
  landmarks?: Point[]
}

interface Model3DProps {
  modelUrl: string
  productImages?: string[]
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

export default function TryOn3D({ 
  modelUrl, 
  productImages,
  faceData, 
  calibration 
}: Model3DProps) {
  const [currentFaceData, setCurrentFaceData] = useState<FaceTrackingData | null>(null)

  const handleFaceDataChange = (newFaceData: FaceTrackingData | null) => {
    setCurrentFaceData(newFaceData)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Camera preview takes full available space */}
      <div className="flex-1 min-h-0 w-full">
        <FaceTracking3DViewer
          modelUrl={modelUrl}
          scale={calibration.scale}
          offsetX={calibration.offsetX}
          offsetY={calibration.offsetY}
          offsetZ={calibration.offsetZ}
          rotationX={calibration.rotationX}
          rotationY={calibration.rotationY}
          rotationZ={calibration.rotationZ}
          onCalibrationChange={(cal) => {
            // Handle calibration changes if needed
          }}
          onFaceDataChange={handleFaceDataChange}
        />
      </div>

      {/* Controls removed as requested */}
    </div>
  )
}