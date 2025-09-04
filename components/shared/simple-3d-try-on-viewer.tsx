'use client'

import React, { useState } from 'react'
import Simple3DViewer from './simple-3d-viewer'
import { Button } from '@/components/ui/button'
import { RotateCcw, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface Simple3DTryOnViewerProps {
  modelUrl?: string
  onClose?: () => void
}

export default function Simple3DTryOnViewer({ 
  modelUrl, 
  onClose 
}: Simple3DTryOnViewerProps) {
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [offsetZ, setOffsetZ] = useState(0)
  const [rotationX, setRotationX] = useState(0)
  const [rotationY, setRotationY] = useState(0)
  const [rotationZ, setRotationZ] = useState(0)

  const handleCalibrationChange = (calibration: {
    scale: number
    offsetX: number
    offsetY: number
    offsetZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }) => {
    // This could be used to save calibration settings
    console.log('Calibration changed:', calibration)
  }

  const resetView = () => {
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
    setOffsetZ(0)
    setRotationX(0)
    setRotationY(0)
    setRotationZ(0)
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.1))
  }

  const rotateLeft = () => {
    setRotationY(prev => prev - 15)
  }

  const rotateRight = () => {
    setRotationY(prev => prev + 15)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">3D Virtual Try-On</h3>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <Simple3DViewer
              modelUrl={modelUrl}
              scale={scale}
              offsetX={offsetX}
              offsetY={offsetY}
              offsetZ={offsetZ}
              rotationX={rotationX}
              rotationY={rotationY}
              rotationZ={rotationZ}
              onCalibrationChange={handleCalibrationChange}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">View Controls</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomIn}
                    className="flex-1"
                  >
                    <ZoomIn className="w-4 h-4 mr-1" />
                    Zoom In
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomOut}
                    className="flex-1"
                  >
                    <ZoomOut className="w-4 h-4 mr-1" />
                    Zoom Out
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotateLeft}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Rotate Left
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotateRight}
                    className="flex-1"
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Rotate Right
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset View
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Position Controls</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Scale: {scale.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">X Position: {offsetX.toFixed(1)}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Y Position: {offsetY.toFixed(1)}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Z Position: {offsetZ.toFixed(1)}</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={offsetZ}
                    onChange={(e) => setOffsetZ(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Rotation Controls</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">X Rotation: {rotationX}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="15"
                    value={rotationX}
                    onChange={(e) => setRotationX(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Y Rotation: {rotationY}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="15"
                    value={rotationY}
                    onChange={(e) => setRotationY(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Z Rotation: {rotationZ}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="15"
                    value={rotationZ}
                    onChange={(e) => setRotationZ(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
