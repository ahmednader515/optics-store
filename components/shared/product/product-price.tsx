'use client'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProductPriceProps {
  price: number
  originalPrice?: number
  currency?: string
  className?: string
  plain?: boolean
}

export default function ProductPrice({
  price,
  originalPrice,
  currency = 'EGP',
  className,
  plain = false,
}: ProductPriceProps) {
  const formatPrice = (price: number) => {
    // Ensure price is a valid number
    const numericPrice = Number(price)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return '0.00 ج.م'
    }
    
    // Custom formatting for Egyptian Pound to show ج.م
    if (currency === 'EGP') {
      return `${numericPrice.toFixed(2)} ج.م`
    }
    
    // Fallback to standard currency formatting for other currencies
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency,
    }).format(numericPrice)
  }

  const hasDiscount = Number(originalPrice) > 0 && Number(price) > 0 && Number(originalPrice) > Number(price)

  if (plain) {
    return <span>{formatPrice(price)}</span>
  }

  // Don't render anything if price is 0 or invalid
  if (!price || Number(price) <= 0) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-1 items-start text-left', className)} dir="rtl">
      <span className='text-2xl font-bold text-primary text-left'>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span className='text-sm text-muted-foreground line-through text-left'>
            {formatPrice(originalPrice)}
          </span>
          <Badge variant='destructive' className='text-xs w-fit text-left'>
            {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% خصم
          </Badge>
        </>
      )}
    </div>
  )
}
