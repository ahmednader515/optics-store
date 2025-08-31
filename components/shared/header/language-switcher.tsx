'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  return (
    <Button variant='ghost' size='icon' disabled>
      <Globe className='h-5 w-5' />
      <span className='sr-only'>Language</span>
    </Button>
  )
}
