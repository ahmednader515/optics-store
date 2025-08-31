'use client'

import React from 'react'

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  className?: string
}

export default function LoadingOverlay({ 
  isLoading, 
  text = 'جاري التحميل...',
  className = '' 
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm mx-4" dir="rtl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {text}
            </h3>
            <p className="text-sm text-gray-600">
              يرجى الانتظار بينما نقوم بتحميل المحتوى
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Smaller inline loading component for buttons and small areas
export function LoadingSpinner({ 
  size = 'md', 
  text = 'جاري التحميل...',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-3',
    lg: 'w-8 h-8 border-4'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} dir="rtl">
      <div className={`${sizeClasses[size]} border-orange-200 border-t-orange-600 rounded-full animate-spin`}></div>
      {text && (
        <span className="text-sm text-gray-600">
          {text}
        </span>
      )}
    </div>
  )
}

// Full page loading component (alternative to the old loading page)
export function FullPageLoading({ 
  text = 'جاري تحميل الصفحة...',
  className = '' 
}: { 
  text?: string
  className?: string
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`} dir="rtl">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {text}
          </h1>
          <p className="text-gray-600">
            يرجى الانتظار بينما نقوم بتحميل الصفحة
          </p>
        </div>
      </div>
    </div>
  )
}
