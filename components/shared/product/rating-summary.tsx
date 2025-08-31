'use client'
import React from 'react'
import { Star, StarHalf } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface RatingSummaryProps {
  ratings: {
    rating: number
    count: number
  }[]
  totalRatings: number
  averageRating: number
}

export default function RatingSummary({
  ratings,
  totalRatings,
  averageRating,
}: RatingSummaryProps) {
  const getStarIcon = (rating: number, index: number) => {
    if (rating >= index + 1) {
      return <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
    } else if (rating > index) {
      return <StarHalf className='w-4 h-4 fill-yellow-400 text-yellow-400' />
    }
    return <Star className='w-4 h-4 text-gray-300' />
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <div className='text-center'>
          <div className='text-3xl font-bold'>{averageRating.toFixed(1)}</div>
          <div className='flex items-center gap-1'>
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index}>{getStarIcon(averageRating, index)}</span>
            ))}
          </div>
          <div className='text-sm text-muted-foreground'>
            {totalRatings} ratings
          </div>
        </div>
        <div className='flex-1 space-y-2'>
          {[5, 4, 3, 2, 1].map((rating) => {
            const ratingData = ratings.find((r) => r.rating === rating)
            const count = ratingData?.count || 0
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0

            return (
              <div key={rating} className='flex items-center gap-2'>
                <span className='text-sm w-4'>{rating}</span>
                <Progress value={percentage} className='flex-1 h-2' />
                <span className='text-sm text-muted-foreground w-12 text-right'>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
