export default function OrdersLoading() {
  return (
    <div>
      <div className='flex gap-2'>
        <div className='h-4 bg-gray-200 rounded w-16 animate-pulse'></div>
        <div className='h-4 bg-gray-200 rounded w-4 animate-pulse'></div>
        <div className='h-4 bg-gray-200 rounded w-24 animate-pulse'></div>
      </div>
      <div className='h-8 bg-gray-200 rounded w-32 mt-4 animate-pulse'></div>
      
      {/* Orders Table Skeleton */}
      <div className='overflow-x-auto'>
        <div className='h-10 bg-gray-200 rounded w-full mb-4 animate-pulse'></div>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-12 bg-gray-200 rounded w-full animate-pulse'></div>
          ))}
        </div>
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
