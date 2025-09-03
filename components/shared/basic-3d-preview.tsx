'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

interface Basic3DPreviewProps {
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

export default function Basic3DPreview({
  modelUrl,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  onCalibrationChange
}: Basic3DPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [localScale, setLocalScale] = useState(scale)
  const [localOffsetX, setLocalOffsetX] = useState(offsetX)
  const [localOffsetY, setLocalOffsetY] = useState(offsetY)
  const [localOffsetZ, setLocalOffsetZ] = useState(offsetZ)
  const [localRotationX, setLocalRotationX] = useState(rotationX)
  const [localRotationY, setLocalRotationY] = useState(rotationY)
  const [localRotationZ, setLocalRotationZ] = useState(rotationZ)
  const [isLoading, setIsLoading] = useState(false)

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

  // Simple 3D preview using basic Three.js
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw a simple 3D-like representation
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // Draw a simple wireframe cube to represent the 3D model
    const size = 60 * localScale
    const x = centerX + localOffsetX * 20
    const y = centerY + localOffsetY * 20
    
    ctx.strokeStyle = modelUrl ? '#3b82f6' : '#6b7280'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    // Draw a simple cube wireframe
    const halfSize = size / 2
    const points = [
      // Front face
      { x: x - halfSize, y: y - halfSize },
      { x: x + halfSize, y: y - halfSize },
      { x: x + halfSize, y: y + halfSize },
      { x: x - halfSize, y: y + halfSize },
      { x: x - halfSize, y: y - halfSize },
      
      // Back face (offset)
      { x: x - halfSize + 20, y: y - halfSize + 20 },
      { x: x + halfSize + 20, y: y - halfSize + 20 },
      { x: x + halfSize + 20, y: y + halfSize + 20 },
      { x: x - halfSize + 20, y: y + halfSize + 20 },
      { x: x - halfSize + 20, y: y - halfSize + 20 },
      
      // Connecting lines
      { x: x - halfSize, y: y - halfSize },
      { x: x - halfSize + 20, y: y - halfSize + 20 },
      
      { x: x + halfSize, y: y - halfSize },
      { x: x + halfSize + 20, y: y - halfSize + 20 },
      
      { x: x + halfSize, y: y + halfSize },
      { x: x + halfSize + 20, y: y + halfSize + 20 },
      
      { x: x - halfSize, y: y + halfSize },
      { x: x - halfSize + 20, y: y + halfSize + 20 }
    ]
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    
    ctx.stroke()
    
    // Add rotation indicator
    if (localRotationX !== 0 || localRotationY !== 0 || localRotationZ !== 0) {
      ctx.fillStyle = '#f59e0b'
      ctx.font = '12px Arial'
      ctx.fillText(`R: ${localRotationX.toFixed(0)}°, ${localRotationY.toFixed(0)}°, ${localRotationZ.toFixed(0)}°`, 10, 20)
    }
    
  }, [modelUrl, localScale, localOffsetX, localOffsetY, localOffsetZ, localRotationX, localRotationY, localRotationZ])

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
        {/* Basic 3D Preview */}
        <div className="w-full h-64 border rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="border rounded"
            />
            <p className="text-xs text-gray-500 mt-2">
              {modelUrl ? 'معاينة مبسطة للنموذج' : 'ارفع نموذج ثلاثي الأبعاد لمعاينته'}
            </p>
          </div>
        </div>

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
