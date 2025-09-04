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
  const [showControls, setShowControls] = useState(true)
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

      {/* Compact controls at the bottom */}
      <div className="mt-2 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentFaceData ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-600">
              {currentFaceData ? 'Face Detected' : 'No Face Detected'}
            </span>
          </div>
          <div className="text-gray-500">
            Scale: {calibration.scale.toFixed(2)}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? 'Hide' : 'Show'} Controls
        </Button>
      </div>

      {showControls && (
        <div className="mt-2 mx-4 mb-4 p-3 bg-gray-50 border rounded-lg">
          <h4 className="font-medium mb-2 text-sm">Face Tracking Status</h4>
          {currentFaceData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Face Scale:</span> {currentFaceData.scale.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">Yaw:</span> {currentFaceData.rotation.yaw.toFixed(1)}°
              </div>
              <div>
                <span className="text-gray-600">Pitch:</span> {currentFaceData.rotation.pitch.toFixed(1)}°
              </div>
              <div>
                <span className="text-gray-600">Roll:</span> {currentFaceData.rotation.roll.toFixed(1)}°
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600">No face detected. Please position your face in front of the camera.</p>
          )}
          
          <div className="mt-2 pt-2 border-t">
            <h5 className="font-medium mb-1 text-sm">Calibration Settings</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Scale:</span> {calibration.scale.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">X:</span> {calibration.offsetX.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">Y:</span> {calibration.offsetY.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">Z:</span> {calibration.offsetZ.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">Rot X:</span> {calibration.rotationX}°
              </div>
              <div>
                <span className="text-gray-600">Rot Y:</span> {calibration.rotationY}°
              </div>
              <div>
                <span className="text-gray-600">Rot Z:</span> {calibration.rotationZ}°
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}