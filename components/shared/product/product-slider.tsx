'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import ProductCard from './product-card'
import { IProductInput } from '@/types'

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string
  products: (IProductInput & { id: string })[]
  hideDetails?: boolean
}) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  // Calculate if we need carousel navigation
  const itemsPerView = hideDetails ? 6 : 5 // Based on the basis classes
  const needsCarousel = products.length > 1 // Always show navigation on mobile since we show 1 per slide

  React.useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  return (
    <div className='w-full bg-white font-cairo rounded-xl p-4 sm:p-6' dir="rtl">
      <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-right text-gray-800'>{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          slidesToScroll: 1,
        }}
        className='w-full'
        setApi={setApi}
        dir='rtl'
      >
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem
              key={product.slug}
              className={
                hideDetails
                  ? 'basis-full sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
                  : 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
              }
            >
              <ProductCard
                hideDetails={hideDetails}
                hideAddToCart
                hideBorder
                product={product}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation buttons - always visible on mobile, conditional on larger screens */}
        <CarouselPrevious 
          className='-left-4 sm:-left-6 bg-white/80 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10 block sm:hidden text-gray-600 hover:text-black transition-colors duration-200' 
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </CarouselPrevious>
        <CarouselNext 
          className='-right-4 sm:-right-6 bg-white/80 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10 block sm:hidden text-gray-600 hover:text-black transition-colors duration-200' 
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </CarouselNext>
        
        {/* Navigation buttons for larger screens - only when needed */}
        {needsCarousel && (
          <>
            <CarouselPrevious 
              className='-left-4 sm:-left-6 bg-white/80 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex text-gray-600 hover:text-black transition-colors duration-200' 
              style={{ display: canScrollPrev ? 'flex' : 'none' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </CarouselPrevious>
            <CarouselNext 
              className='-right-4 sm:-right-6 bg-white/80 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex text-gray-600 hover:text-black transition-colors duration-200' 
              style={{ display: canScrollNext ? 'flex' : 'none' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </CarouselNext>
          </>
        )}
      </Carousel>
    </div>
  )
}
