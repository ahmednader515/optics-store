import { Card, CardContent } from '@/components/ui/card'

export default function AccountLoading() {
  return (
    <div>
      <div className='h-8 bg-gray-200 rounded w-32 py-4 animate-pulse'></div>
      
      {/* Account Cards Skeleton */}
      <div className='grid md:grid-cols-3 gap-4 items-stretch'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='flex items-start gap-4 p-6'>
              <div className='w-12 h-12 bg-gray-200 rounded animate-pulse'></div>
              <div className='flex-1'>
                <div className='h-6 bg-gray-200 rounded w-24 mb-2 animate-pulse'></div>
                <div className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browsing History Skeleton */}
      <div className='mt-16'>
        <div className='h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse'></div>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='p-4 border rounded-lg'>
              <div className='flex gap-4'>
                <div className='w-16 h-16 bg-gray-200 rounded animate-pulse'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
