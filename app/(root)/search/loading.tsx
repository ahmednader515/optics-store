import { Card, CardContent } from '@/components/ui/card'

export default function SearchLoading() {
  return (
    <div className='container mx-auto px-4 py-8' dir="rtl">
      {/* Search Header Skeleton */}
      <div className='mb-8 bg-white rounded-xl p-6 shadow-sm'>
        <div className='h-8 bg-gray-200 rounded w-3/4 mb-3 animate-pulse'></div>
        <div className='h-6 bg-gray-200 rounded w-1/2 animate-pulse'></div>
      </div>

      {/* Desktop Layout: Side-by-side filters and products */}
      <div className='hidden lg:flex gap-6'>
        {/* Left Sidebar - Filters */}
        <div className='w-80 flex-shrink-0'>
          <div className='sticky top-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse'></div>
                <div className='space-y-3'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Main Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm'>
            <div className='h-8 bg-gray-200 rounded w-32 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-48 animate-pulse'></div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className='overflow-hidden'>
                <CardContent className='p-4'>
                  <div className='w-full h-48 bg-gray-200 rounded-lg mb-3 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse'></div>
                  <div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout: Filters on top, products below */}
      <div className='lg:hidden'>
        {/* Filters Section */}
        <div className='mb-6'>
          <Card>
            <CardContent className='p-4'>
              <div className='h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse'></div>
              <div className='space-y-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className='w-full'>
          <div className='flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm'>
            <div className='h-8 bg-gray-200 rounded w-32 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-48 animate-pulse'></div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className='overflow-hidden'>
                <CardContent className='p-4'>
                  <div className='w-full h-48 bg-gray-200 rounded-lg mb-3 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse'></div>
                  <div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
