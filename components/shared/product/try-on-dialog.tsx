"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import VirtualTryOn from '@/components/shared/virtual-try-on'

type TryOnDialogProps = {
  overlayImageUrl?: string
  triggerClassName?: string
}

export default function TryOnDialog({ overlayImageUrl, triggerClassName }: TryOnDialogProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>جرّب النظارات افتراضياً</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 sm:p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-base sm:text-lg">جرّب النظارات على وجهك</DialogTitle>
        </DialogHeader>
        {/* Mount the camera UI only when dialog is open */}
        {open && (
          <div className="p-3 sm:p-4">
            <VirtualTryOn overlayImageUrl={overlayImageUrl} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


