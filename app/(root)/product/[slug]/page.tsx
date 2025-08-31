import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductGallery from '@/components/shared/product/product-gallery'
import ProductPrice from '@/components/shared/product/product-price'
import AddToCart from '@/components/shared/product/add-to-cart'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import Rating from '@/components/shared/product/rating'
import ReviewList from './review-list'
import { Separator } from '@/components/ui/separator'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Loading skeleton components
function ProductHeaderSkeleton() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12'>
      {/* Product Images Skeleton */}
      <div>
        <div className='w-full h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>

      {/* Product Info Skeleton */}
      <div className='space-y-4 sm:space-y-6'>
        <div>
          <div className='h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
          <div className='h-4 sm:h-6 bg-gray-200 rounded w-1/2 mb-3 sm:mb-4 animate-pulse'></div>
          <div className='h-6 sm:h-8 bg-gray-200 rounded w-1/3 animate-pulse'></div>
        </div>

        <div>
          <div className='h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 animate-pulse'></div>
          <div className='h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
          <div className='h-3 sm:h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
        </div>

        <div>
          <div className='h-10 sm:h-12 bg-gray-200 rounded w-32 animate-pulse'></div>
        </div>

        <Separator />

        <div className='space-y-3 sm:space-y-4'>
          <div>
            <div className='h-5 sm:h-6 bg-gray-200 rounded w-24 mb-2 animate-pulse'></div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              <div className='h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse'></div>
              <div className='h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <div className='mb-8 sm:mb-12'>
      <Separator className='mb-6 sm:mb-8' />
      <div className='h-6 sm:h-8 bg-gray-200 rounded w-36 sm:w-48 mb-4 sm:mb-6 animate-pulse'></div>
      <div className='space-y-3 sm:space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='p-3 sm:p-4 border rounded-lg'>
            <div className='h-4 sm:h-5 bg-gray-200 rounded w-1/3 mb-2 animate-pulse'></div>
            <div className='h-3 sm:h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse'></div>
            <div className='h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse'></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Async components for progressive loading
async function ProductHeader({ slug }: { slug: string }) {
  // Direct database query for product
  const product = await prisma.product.findFirst({
    where: { 
      slug, 
      isPublished: true 
    }
  })

  if (!product) {
    notFound()
  }

  // Convert Decimal values to numbers for client components
  const productData = {
    ...product,
    price: Number(product.price),
    listPrice: Number(product.listPrice),
    avgRating: Number(product.avgRating),
    numReviews: Number(product.numReviews),
  }

  return (
    <>
      {/* Track browsing history */}
      <AddToBrowsingHistory 
        id={productData.id} 
        category={productData.category}
        name={productData.name}
        image={productData.images[0]}
        slug={productData.slug}
      />
      
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12'>
        {/* Product Images */}
        <div>
          <ProductGallery images={productData.images} />
        </div>

        {/* Product Info */}
        <div className='space-y-4 sm:space-y-6'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-2'>{productData.name}</h1>
            <div className='flex items-center gap-2 mb-3 sm:mb-4'>
              <Rating rating={productData.avgRating} />
              <span className='text-xs sm:text-sm text-muted-foreground'>
                ({productData.numReviews} تقييم)
              </span>
            </div>
            <ProductPrice 
              price={productData.price} 
              originalPrice={productData.listPrice}
              className='text-xl sm:text-2xl'
            />
          </div>

          <div>
            <p className='text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4'>{productData.description}</p>
          </div>

          <div>
            <AddToCart product={productData} />
          </div>

          <Separator />

          <div className='space-y-3 sm:space-y-4'>
            <div>
              <h3 className='font-semibold mb-2 text-sm sm:text-base'>تفاصيل المنتج</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm'>
                <div>
                  <span className='text-muted-foreground'>الفئة:</span>
                  <span className='mr-2'>{productData.category}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>العلامة التجارية:</span>
                  <span className='mr-2'>{productData.brand}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

async function ReviewsSection({ slug }: { slug: string }) {
  // Direct database query for product to get ID for reviews
  const product = await prisma.product.findFirst({
    where: { 
      slug, 
      isPublished: true 
    },
    select: { id: true }
  })
  
  return (
    <div className='mb-8 sm:mb-12'>
      <Separator className='mb-6 sm:mb-8' />
      <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>تقييمات العملاء</h2>
      {/* Review List */}
      {product && <ReviewList productId={product.id} />}
    </div>
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  return (
    <div className='container mx-auto px-4 py-6 sm:py-8' dir="rtl">
      {/* Product Header - Load first */}
      <Suspense fallback={<ProductHeaderSkeleton />}>
        <ProductHeader slug={slug} />
      </Suspense>

      {/* Reviews Section - Load second */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection slug={slug} />
      </Suspense>
    </div>
  )
}
