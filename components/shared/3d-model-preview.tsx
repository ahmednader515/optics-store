'use client'

import React, { Suspense, useRef, useState, lazy } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

// Lazy load Three.js components to avoid SSR issues
const Canvas = lazy(() => import('@react-three/fiber').then(module => ({ default: module.Canvas })))
const OrbitControls = lazy(() => import('@react-three/drei').then(module => ({ default: module.OrbitControls })))
const Model3D = lazy(() => import('./3d-model-component').then(module => ({ default: module.Model3D })))
const LoadingFallback = lazy(() => import('./3d-model-component').then(module => ({ default: module.LoadingFallback })))

interface Model3DPreviewProps {
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



// Error boundary for 3D components
class ThreeJSErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Preview Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-64 border rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">خطأ في تحميل المعاينة ثلاثية الأبعاد</p>
            <p className="text-xs mt-1">تأكد من أن المتصفح يدعم WebGL</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function Model3DPreview({
  modelUrl,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  onCalibrationChange
}: Model3DPreviewProps) {
  const [localScale, setLocalScale] = useState(scale)
  const [localOffsetX, setLocalOffsetX] = useState(offsetX)
  const [localOffsetY, setLocalOffsetY] = useState(offsetY)
  const [localOffsetZ, setLocalOffsetZ] = useState(offsetZ)
  const [localRotationX, setLocalRotationX] = useState(rotationX)
  const [localRotationY, setLocalRotationY] = useState(rotationY)
  const [localRotationZ, setLocalRotationZ] = useState(rotationZ)

  const resetCalibration = () => {
    setLocalScale(1)
    setLocalOffsetX(0)
    setLocalOffsetY(0)
    setLocalOffsetZ(0)
    setLocalRotationX(0)
    setLocalRotationY(0)
    setLocalRotationZ(0)
    
    if (onCalibrationChange) {
      onCalibrationChange({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        offsetZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0
      })
    }
  }

  const handleCalibrationChange = (newValues: Partial<typeof localScale>) => {
    const updatedValues = {
      scale: localScale,
      offsetX: localOffsetX,
      offsetY: localOffsetY,
      offsetZ: localOffsetZ,
      rotationX: localRotationX,
      rotationY: localRotationY,
      rotationZ: localRotationZ,
      ...newValues
    }
    
    if (onCalibrationChange) {
      onCalibrationChange(updatedValues)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">معاينة النموذج ثلاثي الأبعاد</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetCalibration}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Preview */}
        <ThreeJSErrorBoundary>
          <div className="w-full h-56 border rounded-lg bg-gray-50">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">جاري تحميل المعاينة...</p>
                </div>
              </div>
            }>
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={<LoadingFallback />}>
                  <Model3D
                    modelUrl={modelUrl}
                    scale={localScale}
                    offsetX={localOffsetX}
                    offsetY={localOffsetY}
                    offsetZ={localOffsetZ}
                    rotationX={localRotationX}
                    rotationY={localRotationY}
                    rotationZ={localRotationZ}
                  />
                </Suspense>
                <OrbitControls enablePan={false} />
              </Canvas>
            </Suspense>
          </div>
        </ThreeJSErrorBoundary>

        {/* Calibration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scale */}
          <div className="space-y-2">
            <label className="text-sm font-medium">المقياس: {localScale.toFixed(2)}</label>
            <Slider
              value={[localScale]}
              onValueChange={([value]) => {
                setLocalScale(value)
                handleCalibrationChange({ scale: value })
              }}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* X Offset */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الإزاحة X: {localOffsetX.toFixed(2)}</label>
            <Slider
              value={[localOffsetX]}
              onValueChange={([value]) => {
                setLocalOffsetX(value)
                handleCalibrationChange({ offsetX: value })
              }}
              min={-2}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Y Offset */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الإزاحة Y: {localOffsetY.toFixed(2)}</label>
            <Slider
              value={[localOffsetY]}
              onValueChange={([value]) => {
                setLocalOffsetY(value)
                handleCalibrationChange({ offsetY: value })
              }}
              min={-2}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Z Offset */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الإزاحة Z: {localOffsetZ.toFixed(2)}</label>
            <Slider
              value={[localOffsetZ]}
              onValueChange={([value]) => {
                setLocalOffsetZ(value)
                handleCalibrationChange({ offsetZ: value })
              }}
              min={-2}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* X Rotation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الدوران X: {localRotationX.toFixed(0)}°</label>
            <Slider
              value={[localRotationX]}
              onValueChange={([value]) => {
                setLocalRotationX(value)
                handleCalibrationChange({ rotationX: value })
              }}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
          </div>

          {/* Y Rotation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الدوران Y: {localRotationY.toFixed(0)}°</label>
            <Slider
              value={[localRotationY]}
              onValueChange={([value]) => {
                setLocalRotationY(value)
                handleCalibrationChange({ rotationY: value })
              }}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
          </div>

          {/* Z Rotation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الدوران Z: {localRotationZ.toFixed(0)}°</label>
            <Slider
              value={[localRotationZ]}
              onValueChange={([value]) => {
                setLocalRotationZ(value)
                handleCalibrationChange({ rotationZ: value })
              }}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {!modelUrl && (
          <div className="text-center text-gray-500 text-sm">
            ارفع نموذج ثلاثي الأبعاد لمعاينته
          </div>
        )}
      </CardContent>
    </Card>
  )
}
