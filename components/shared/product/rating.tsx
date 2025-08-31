import React from 'react'
import { Star } from 'lucide-react'

export default function Rating({
  rating = 0,
  size = 'default',
  showText = false,
}: {
  rating: number
  size?: 'small' | 'default' | 'large'
  showText?: boolean
}) {
  const fullStars = Math.floor(rating)
  const partialStar = rating % 1
  const emptyStars = 5 - fullStars - (partialStar > 0 ? 1 : 0)

  const sizeClasses = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  }

  const currentSize = sizeClasses[size]

  return (
    <div className='flex items-center gap-1' aria-label={`Rating: ${rating} out of 5 stars`}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${currentSize} fill-yellow-400 text-yellow-400`}
        />
      ))}
      
      {/* Partial star - only show if there's a partial value */}
      {partialStar > 0 && partialStar < 1 && (
        <div className='relative'>
          <Star className={`${currentSize} text-gray-300`} />
          <div
            className='absolute top-0 right-0 overflow-hidden'
            style={{ width: `${partialStar * 100}%` }}
          >
            <Star className={`${currentSize} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${currentSize} text-gray-300`}
        />
      ))}
      
      {/* Optional rating text */}
      {showText && (
        <span className='text-sm font-medium text-gray-700 mr-1'>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
