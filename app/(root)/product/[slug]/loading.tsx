import { Separator } from '@/components/ui/separator'

export default function ProductLoading() {
  return (
    <div className='container mx-auto px-4 py-8' dir="rtl">
      {/* Product Header Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
        {/* Product Images Skeleton */}
        <div>
          <div className='w-full h-96 bg-gray-200 rounded-lg animate-pulse'></div>
        </div>

        {/* Product Info Skeleton */}
        <div className='space-y-6'>
          <div>
            <div className='h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
            <div className='h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse'></div>
            <div className='h-8 bg-gray-200 rounded w-1/3 animate-pulse'></div>
          </div>

          <div>
            <div className='h-4 bg-gray-200 rounded w-full mb-2 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
          </div>

          <div>
            <div className='h-12 bg-gray-200 rounded w-32 animate-pulse'></div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <div>
              <div className='h-6 bg-gray-200 rounded w-24 mb-2 animate-pulse'></div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className='mb-12'>
        <Separator className='mb-8' />
        <div className='h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse'></div>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='p-4 border rounded-lg'>
              <div className='h-5 bg-gray-200 rounded w-1/3 mb-2 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
