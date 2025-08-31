import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface ServerPaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
  className?: string
}

export default function ServerPagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  className = '',
}: ServerPaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = window.innerWidth < 768 ? 1 : 2 // Show fewer pages on mobile
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`} dir="rtl">
      {/* First page button - hidden on mobile */}
      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === 1}
        className='hidden sm:flex'
      >
        <Link href={createPageUrl(1)}>
          <ChevronsRight className='h-3 w-3 sm:h-4 sm:w-4' />
          <span className='sr-only'>First page</span>
        </Link>
      </Button>

      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === 1}
        className='h-8 w-8 sm:h-9 sm:w-9 p-0'
      >
        <Link href={createPageUrl(currentPage - 1)}>
          <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4' />
          <span className='sr-only'>Previous page</span>
        </Link>
      </Button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className='px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground'>...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              asChild
              className='h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm'
            >
              <Link href={createPageUrl(page as number)}>
                {page}
              </Link>
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === totalPages}
        className='h-8 w-8 sm:h-9 sm:w-9 p-0'
      >
        <Link href={createPageUrl(currentPage + 1)}>
          <ChevronLeft className='h-3 w-3 sm:h-4 sm:w-4' />
          <span className='sr-only'>Next page</span>
        </Link>
      </Button>

      {/* Last page button - hidden on mobile */}
      <Button
        variant='outline'
        size='sm'
        asChild
        disabled={currentPage === totalPages}
        className='hidden sm:flex'
      >
        <Link href={createPageUrl(totalPages)}>
          <ChevronsLeft className='h-3 w-3 sm:h-4 sm:w-4' />
          <span className='sr-only'>Last page</span>
        </Link>
      </Button>
    </div>
  )
}
