'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import LoadingOverlay, { LoadingSpinner, FullPageLoading } from './loading-overlay'
import { useLoading } from '@/hooks/use-loading'

export default function LoadingExample() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading()
  const [showFullPage, setShowFullPage] = useState(false)

  const simulateAsyncOperation = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return 'Operation completed!'
  }

  const handleWithLoading = async () => {
    try {
      const result = await withLoading(
        simulateAsyncOperation,
        (result) => console.log('Success:', result),
        (error) => console.error('Error:', error)
      )
      console.log('Final result:', result)
    } catch (error) {
      console.error('Operation failed:', error)
    }
  }

  const handleManualLoading = () => {
    startLoading()
    setTimeout(() => stopLoading(), 3000)
  }

  const handleFullPageLoading = () => {
    setShowFullPage(true)
    setTimeout(() => setShowFullPage(false), 3000)
  }

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-center mb-8">أمثلة على مكونات التحميل</h1>
      
      {/* Loading Overlay Example */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">مثال على شاشة التحميل المتراكبة</h2>
        <div className="flex gap-4">
          <Button onClick={handleManualLoading} disabled={isLoading}>
            {isLoading ? 'جاري التحميل...' : 'بدء التحميل اليدوي'}
          </Button>
          <Button onClick={handleWithLoading} disabled={isLoading}>
            {isLoading ? 'جاري التحميل...' : 'بدء التحميل التلقائي'}
          </Button>
        </div>
        <LoadingOverlay 
          isLoading={isLoading} 
          text="جاري معالجة الطلب..."
        />
      </div>

      {/* Loading Spinner Examples */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">أمثلة على مؤشرات التحميل</h2>
        <div className="flex gap-8 items-center">
          <LoadingSpinner size="sm" text="تحميل صغير" />
          <LoadingSpinner size="md" text="تحميل متوسط" />
          <LoadingSpinner size="lg" text="تحميل كبير" />
          <LoadingSpinner size="md" />
        </div>
      </div>

      {/* Full Page Loading Example */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">مثال على تحميل الصفحة الكاملة</h2>
        <Button onClick={handleFullPageLoading}>
          عرض تحميل الصفحة الكاملة
        </Button>
        {showFullPage && <FullPageLoading text="جاري تحميل البيانات..." />}
      </div>

      {/* Button Loading States */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">حالات التحميل في الأزرار</h2>
        <div className="flex gap-4">
          <Button disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" text="جاري..." />
            ) : (
              'زر عادي'
            )}
          </Button>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" text="جاري..." />
            ) : (
              'زر بحدود'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
