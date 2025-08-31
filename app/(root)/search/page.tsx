import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductCard from '@/components/shared/product/product-card'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import SearchFilters from '@/components/shared/search-filters'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
    tag?: string | string[]
  }>
}

// Loading skeleton components
function SearchHeaderSkeleton() {
  return (
    <div className='mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
      <div className='h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3 animate-pulse'></div>
      <div className='h-4 sm:h-6 bg-gray-200 rounded w-1/2 animate-pulse'></div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className='overflow-hidden'>
          <CardContent className='p-3 sm:p-4'>
            <div className='w-full h-36 sm:h-48 bg-gray-200 rounded-lg mb-2 sm:mb-3 animate-pulse'></div>
            <div className='h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>
            <div className='h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse'></div>
            <div className='h-4 sm:h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className='w-full'>
      <Card>
        <CardContent className='p-3 sm:p-4'>
          <div className='h-5 sm:h-6 bg-gray-200 rounded w-20 sm:w-24 mb-3 sm:mb-4 animate-pulse'></div>
          <div className='space-y-2 sm:space-y-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Async components for progressive loading
async function SearchHeader({ params, translations }: { 
  params: any, 
  translations: any 
}) {
  const {
    q = '',
    category = '',
  } = params

  return (
    <div className='mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
      <h1 className='text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-right text-gray-800'>
        {q ? `${translations.searchResults} "${q}"` : `${translations.productsIn} ${category}`}
      </h1>
      <p className='text-sm sm:text-base text-gray-600 text-right'>
        {translations.found} {translations.loading} {translations.products}
      </p>
    </div>
  )
}

async function ProductResults({ params, translations }: { 
  params: any, 
  translations: any 
}) {
  const {
    q = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
    page = '1',
    tag = '',
  } = params

  const currentPage = parseInt(page)
  const limit = 12
  const skip = (currentPage - 1) * limit

  // Build Prisma where clause
  const where: any = { isPublished: true }
  
  if (q && q !== 'all') {
    where.name = { contains: q, mode: 'insensitive' }
  }
  
  if (category && category !== 'all') {
    where.category = category
  }
  
  if (tag && tag !== 'all') {
    if (Array.isArray(tag)) {
      where.tags = { hasSome: tag }
    } else {
      where.tags = { has: tag }
    }
  }
  
  if (minPrice && maxPrice) {
    where.price = { 
      gte: parseFloat(minPrice), 
      lte: parseFloat(maxPrice) 
    }
  }

  // Build order by clause
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'best-selling') {
    orderBy = { numSales: 'desc' }
  } else if (sort === 'price-low-to-high') {
    orderBy = { price: 'asc' }
  } else if (sort === 'price-high-to-low') {
    orderBy = { price: 'desc' }
  } else if (sort === 'avg-customer-review') {
    orderBy = { avgRating: 'desc' }
  }

  // Direct database queries
  const products = await (prisma as any).product.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  })
  
  const totalProducts = await (prisma as any).product.count({ where })

  // Convert Decimal values to numbers for client components
  const normalizedProducts = products.map((product: any) => ({
    ...product,
    price: Number(product.price),
    listPrice: Number(product.listPrice),
    avgRating: Number(product.avgRating),
    numReviews: Number(product.numReviews),
  }))

  const totalPages = Math.ceil(totalProducts / limit)
  const from = skip + 1
  const to = Math.min(skip + limit, totalProducts)

  return (
    <>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 bg-white rounded-xl p-3 sm:p-4 shadow-sm'>
        <ProductSortSelector 
          sortOrders={[
            { value: 'newest', name: translations.newest },
            { value: 'price-low-to-high', name: translations.priceLowToHigh },
            { value: 'price-high-to-low', name: translations.priceHighToLow },
            { value: 'best-selling', name: translations.bestSelling },
            { value: 'avg-customer-review', name: translations.avgCustomerReview }
          ]}
          sort={sort}
          params={params}
        />
        <p className='text-xs sm:text-sm text-gray-600 text-right'>
          {translations.showing} {from}-{to} {translations.of} {totalProducts} {translations.products}
        </p>
      </div>

      {products.length === 0 ? (
        <div className='text-center py-8 sm:py-12'>
          <h3 className='text-base sm:text-lg font-semibold mb-2'>{translations.noProductsFound}</h3>
          <p className='text-sm sm:text-base text-muted-foreground px-4'>
            {translations.tryAdjustingSearch}
          </p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
            {normalizedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Simple pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {currentPage > 1 && (
                <a 
                  href={`/search?${new URLSearchParams({
                    ...params,
                    page: (currentPage - 1).toString()
                  })}`}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  السابق
                </a>
              )}
              
              <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
              
              {currentPage < totalPages && (
                <a 
                  href={`/search?${new URLSearchParams({
                    ...params,
                    page: (currentPage + 1).toString()
                  })}`}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  التالي
                </a>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

async function SearchFiltersSection({ params }: { params: any }) {
  // Direct database query for categories
  const categories = await (prisma as any).product.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  })
  
  const categoryList = categories.map((c: any) => c.category)
  const tags = ['best-seller', 'featured', 'new-arrival', 'todays-deal', 'pain-relief', 'vitamins', 'allergy', 'digestive', 'cold-flu']

  return (
    <div className='w-full'>
      <SearchFilters 
        categories={categoryList}
        tags={tags}
        maxPrice={1000}
      />
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const {
    q = '',
    category = '',
  } = params

  if (!q && !category) {
    notFound()
  }

  // Arabic translations
  const translations = {
    searchResults: 'نتائج البحث',
    productsIn: 'المنتجات في',
    found: 'تم العثور على',
    product: 'منتج',
    products: 'منتجات',
    loading: '...',
    filters: 'المرشحات',
    filterOptionsComingSoon: 'خيارات التصفية قريباً...',
    showing: 'عرض',
    of: 'من',
    noProductsFound: 'لم يتم العثور على منتجات',
    tryAdjustingSearch: 'حاول تعديل معايير البحث أو تصفح جميع المنتجات',
    sortBy: 'ترتيب حسب',
    newest: 'الأحدث',
    priceLowToHigh: 'السعر: من الأقل إلى الأعلى',
    priceHighToLow: 'السعر: من الأعلى إلى الأعلى',
    bestSelling: 'الأكثر مبيعاً',
    avgCustomerReview: 'متوسط تقييم العملاء'
  }

  return (
    <div className='container mx-auto px-4 py-6 sm:py-8' dir="rtl">
      {/* Search Header - Load first */}
      <Suspense fallback={<SearchHeaderSkeleton />}>
        <SearchHeader params={params} translations={translations} />
      </Suspense>

      {/* Desktop Layout: Side-by-side filters and products */}
      <div className='hidden lg:flex gap-6'>
        {/* Left Sidebar - Filters */}
        <div className='w-80 flex-shrink-0'>
          <Suspense fallback={<FiltersSkeleton />}>
            <SearchFiltersSection params={params} />
          </Suspense>
        </div>

        {/* Right Side - Main Content */}
        <div className='flex-1 min-w-0'>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductResults params={params} translations={translations} />
          </Suspense>
        </div>
      </div>

      {/* Mobile Layout: Filters on top, products below */}
      <div className='lg:hidden'>
        {/* Filters Section - Load second, positioned at top */}
        <div className='mb-6 sm:mb-8'>
          <Suspense fallback={<FiltersSkeleton />}>
            <SearchFiltersSection params={params} />
          </Suspense>
        </div>

        {/* Main Content - Load third, full width */}
        <div className='w-full'>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductResults params={params} translations={translations} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
