'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
  name?: string
}

export default function PhoneInput({
  value = '',
  onChange,
  onBlur,
  placeholder = 'أدخل رقم الهاتف',
  className,
  disabled = false,
  error = false,
  name,
}: PhoneInputProps) {
  // Remove +20 prefix if it exists to avoid duplication
  const phoneNumber = value.replace(/^\+20/, '')
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Only allow digits
    const digitsOnly = inputValue.replace(/\D/g, '')
    // Prepend +20 to the phone number
    const fullPhoneNumber = `+20${digitsOnly}`
    if (onChange) {
      onChange(fullPhoneNumber)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }
  }

  return (
    <div className="relative">
      {/* Country Code Selector */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
        <span className="text-2xl">🇪🇬</span>
        <span className="text-sm font-medium text-gray-700">+20</span>
      </div>
      
      {/* Phone Input */}
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "pl-24 text-right font-cairo h-12 text-lg", // pl-24 to make room for country code
          className
        )}
        disabled={disabled}
        dir="ltr" // Left-to-right for phone numbers
        name={name}
      />
    </div>
  )
}
