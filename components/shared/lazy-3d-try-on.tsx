'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Client-only dynamic import to avoid SSR/react-reconciler issues
const TryOn3D = dynamic(() => import('./3d-virtual-try-on'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
        <h3 className="text-lg font-semibold mb-2">جاري تحميل النموذج ثلاثي الأبعاد</h3>
        <p className="text-sm text-gray-600 mb-4">قد يستغرق هذا بضع ثوانٍ على الأجهزة البطيئة</p>
        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
})

interface Lazy3DTryOnProps {
  modelUrl: string
  calibration: {
    scale: number
    offsetX: number
    offsetY: number
    offsetZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
  }
  onClose: () => void
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Try-on Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Error fallback component
function ErrorFallback({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-red-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          خطأ في تحميل النموذج ثلاثي الأبعاد
        </h3>
        <p className="text-sm text-red-600 mb-4">
          حدث خطأ أثناء تحميل النموذج ثلاثي الأبعاد. قد يكون الملف تالفاً أو غير متوافق.
        </p>
        <div className="space-y-2">
          <Button onClick={onClose} variant="outline" className="w-full">
            إغلاق
          </Button>
          <p className="text-xs text-gray-500">
            يمكنك المحاولة مرة أخرى أو استخدام التجربة الافتراضية التقليدية
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Lazy3DTryOn(props: Lazy3DTryOnProps) {
  return (
    <ErrorBoundary fallback={<ErrorFallback onClose={props.onClose} />}>
      <TryOn3D {...props} />
    </ErrorBoundary>
  )
}
