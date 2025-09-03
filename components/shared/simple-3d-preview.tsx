'use client'

import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

interface Simple3DPreviewProps {
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

export default function Simple3DPreview({
  modelUrl,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  onCalibrationChange
}: Simple3DPreviewProps) {
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
        {/* Simple Preview Placeholder */}
        <div className="w-full h-64 border rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">معاينة النموذج ثلاثي الأبعاد</p>
            <p className="text-xs text-gray-400">
              {modelUrl ? 'النموذج محمل بنجاح' : 'ارفع نموذج ثلاثي الأبعاد لمعاينته'}
            </p>
            {modelUrl && (
              <div className="mt-2 text-xs text-gray-600">
                <p>المقياس: {localScale.toFixed(2)}</p>
                <p>الإزاحة: ({localOffsetX.toFixed(1)}, {localOffsetY.toFixed(1)}, {localOffsetZ.toFixed(1)})</p>
                <p>الدوران: ({localRotationX.toFixed(0)}°, {localRotationY.toFixed(0)}°, {localRotationZ.toFixed(0)}°)</p>
              </div>
            )}
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
