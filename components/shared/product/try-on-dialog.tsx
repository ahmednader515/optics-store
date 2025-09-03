"use client"

import React, { Suspense } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import VirtualTryOn from '@/components/shared/virtual-try-on'
import Lazy3DTryOn from '@/components/shared/lazy-3d-try-on'

type TryOnDialogProps = {
  overlayImageUrl?: string
  model3dUrl?: string
  model3dCalibration?: {
    scale: number
    offsetX: number
    offsetY: number
    offsetZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }
  triggerClassName?: string
}

export default function TryOnDialog({ 
  overlayImageUrl, 
  model3dUrl, 
  model3dCalibration,
  triggerClassName 
}: TryOnDialogProps) {
  const [open, setOpen] = React.useState(false)

  // Determine which try-on method to use
  const has3DModel = model3dUrl && model3dCalibration
  const has2DOverlay = overlayImageUrl

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          {has3DModel ? 'جرّب النظارات ثلاثي الأبعاد' : 'جرّب النظارات افتراضياً'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 sm:p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-base sm:text-lg">
            {has3DModel ? 'جرّب النظارات ثلاثي الأبعاد' : 'جرّب النظارات على وجهك'}
          </DialogTitle>
        </DialogHeader>
        {/* Mount the camera UI only when dialog is open */}
        {open && (
          <div className="p-3 sm:p-4">
            {has3DModel ? (
              <Lazy3DTryOn
                modelUrl={model3dUrl!}
                calibration={model3dCalibration!}
                onClose={() => setOpen(false)}
              />
            ) : has2DOverlay ? (
              <VirtualTryOn overlayImageUrl={overlayImageUrl} />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-500">
                <p>لا توجد صورة أو نموذج ثلاثي الأبعاد متاح للتجربة الافتراضية</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


