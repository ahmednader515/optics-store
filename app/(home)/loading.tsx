import { Card, CardContent } from '@/components/ui/card'

export default function HomeLoading() {
  return (
    <div className="font-cairo" dir="rtl">
      {/* Hero section skeleton */}
      <div className="w-full h-96 bg-gray-200 animate-pulse"></div>
      
      <div className='md:p-6 md:space-y-8 bg-gray-50'>
        {/* Categories Section Skeleton */}
        <Card className='w-full rounded-xl shadow-sm'>
          <CardContent className='p-6'>
            <div className='h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse'></div>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='flex flex-col items-center'>
                  <div className='w-20 h-20 bg-gray-200 rounded-lg mb-3 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-16 animate-pulse'></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Deals Section Skeleton */}
        <Card className='w-full rounded-xl shadow-sm'>
          <CardContent className='p-6'>
            <div className='h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse'></div>
            <div className='flex space-x-4 overflow-hidden'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex-shrink-0 w-48'>
                  <div className='w-full h-32 bg-gray-200 rounded-lg mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Best Selling Products Section Skeleton */}
        <Card className='w-full rounded-xl shadow-sm'>
          <CardContent className='p-6'>
            <div className='h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse'></div>
            <div className='flex space-x-4 overflow-hidden'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex-shrink-0 w-48'>
                  <div className='w-full h-32 bg-gray-200 rounded-lg mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
