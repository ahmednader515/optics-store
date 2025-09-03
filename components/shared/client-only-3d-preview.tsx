'use client'

import React, { useState, useEffect } from 'react'

interface ClientOnly3DPreviewProps {
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
}

export default function ClientOnly3DPreview({
  modelUrl,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  onCalibrationChange
}: ClientOnly3DPreviewProps) {
  const [isClient, setIsClient] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(false)
  const [Model3DPreview, setModel3DPreview] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    setHasWebGL(!!gl)
    
    // Only load 3D components if WebGL is supported
    if (gl) {
      import('./3d-model-preview').then((module) => {
        setModel3DPreview(() => module.default)
      }).catch((error) => {
        console.error('Failed to load 3D preview component:', error)
        // Fallback to simple preview if 3D preview fails
        import('./simple-3d-fallback').then((module) => {
          setModel3DPreview(() => module.default)
        })
      })
    } else {
      // Use simple fallback if WebGL is not supported
      import('./simple-3d-fallback').then((module) => {
        setModel3DPreview(() => module.default)
      })
    }
  }, [])

  // All controls are now owned by the inner Model3DPreview to avoid duplication

  if (!isClient) {
    return (
      <div className="w-full">
        <div className="w-full h-56 border rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">جاري تحميل المعاينة ثلاثية الأبعاد...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasWebGL) {
    return (
      <div className="w-full">
        <div className="w-full h-56 border rounded-lg bg-red-50 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-sm font-medium">WebGL غير مدعوم</p>
            <p className="text-xs mt-1">يرجى استخدام متصفح يدعم WebGL لعرض المعاينة ثلاثية الأبعاد</p>
          </div>
        </div>
      </div>
    )
  }

  if (!Model3DPreview) {
    return (
      <div className="w-full">
        <div className="w-full h-56 border rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">جاري تحميل مكونات المعاينة...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Model3DPreview
        modelUrl={modelUrl}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
        offsetZ={offsetZ}
        rotationX={rotationX}
        rotationY={rotationY}
        rotationZ={rotationZ}
        onCalibrationChange={onCalibrationChange}
      />
    </div>
  )
}
