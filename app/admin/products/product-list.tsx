'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { deleteProduct } from '@/lib/actions/product.actions'
import { useToast } from '@/hooks/use-toast'

type Product = {
  id: string
  name: string
  price: number
  category: string
  countInStock: number
  avgRating: number
  isPublished: boolean
  images: string[]
  slug: string
  updatedAt: Date
}

type ProductListProps = {
  initialProducts: Product[]
  totalProducts: number
}

// Loading skeleton component for table rows
const TableRowSkeleton = () => (
  <TableRow className="animate-pulse">
    <TableCell className='text-right py-4 px-4'>
      <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </TableCell>
    <TableCell className='text-right py-4 px-4'>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </TableCell>
    <TableCell className='py-4 px-4'>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </TableCell>
  </TableRow>
)

// Loading skeleton component for mobile cards
const MobileCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

const ProductList = ({ initialProducts, totalProducts }: ProductListProps) => {
  const [page, setPage] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const { toast } = useToast()
  
  // Client-side search and filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page when searching
  }

  // Client-side delete function that calls the API route
  const deleteProductClient = async (id: string) => {
    try {
      // Optimistic update
      setProducts(prev => prev.filter(p => p.id !== id))
      
      // Call the API route
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Show success message
        toast({
          title: 'تم حذف المنتج بنجاح',
          description: result.message,
        })
        // Product is already removed from state
        return { success: true, message: result.message }
      } else {
        // Revert optimistic update on failure
        window.location.reload()
        toast({
          title: 'خطأ في حذف المنتج',
          description: result.message || 'حدث خطأ غير متوقع',
          variant: 'destructive',
        })
        return { success: false, message: result.message || 'حدث خطأ غير متوقع' }
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      // Revert optimistic update on error
      window.location.reload()
      toast({
        title: 'خطأ في حذف المنتج',
        description: 'حدث خطأ غير متوقع أثناء الحذف',
        variant: 'destructive',
      })
      return { success: false, message: 'حدث خطأ أثناء الحذف' }
    }
  }

  return (
    <div className='rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className='space-y-4'>
        {/* Title and Create Button Row */}
        <div className='flex justify-between items-center'>
          <h1 className='font-bold text-lg text-right'>المنتجات</h1>
          <Button asChild variant='default'>
            <Link href='/admin/products/create'>إنشاء منتج</Link>
          </Button>
        </div>

        {/* Search and Results Row */}
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            className='w-auto'
            type='text'
            value={searchQuery}
            onChange={handleSearch}
            placeholder='تصفية بالاسم أو الفئة...'
          />

          <p>
            {filteredProducts.length === 0
              ? 'لا توجد'
              : `${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} من ${filteredProducts.length}`}
            {' نتيجة'}
          </p>
        </div>
        
        {/* Desktop Table - Hidden on mobile */}
        <div className='hidden md:block'>
          <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الصورة</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الاسم</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>السعر</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الفئة</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>المخزون</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>التقييم</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>منشور</TableHead>
                <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>آخر تحديث</TableHead>
                <TableHead className='w-[120px] text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50 border-b border-gray-200">
                    <TableCell className='text-right py-4 px-4'>
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={product.images[0] || '/images/placeholder.jpg'}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className='text-right py-4 px-4'>
                      <Link href={`/admin/products/${product.id}`} className="text-orange-600 hover:text-orange-800 hover:underline font-medium">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className='text-right py-4 px-4 font-semibold text-green-700'>
                      {product.price.toFixed(2)} ج.م
                    </TableCell>
                    <TableCell className='text-right py-4 px-4'>
                      {product.category}
                    </TableCell>
                    <TableCell className='text-right py-4 px-4'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.countInStock > 10 ? 'bg-green-100 text-green-800' : 
                        product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock}
                      </span>
                    </TableCell>
                    <TableCell className='text-right py-4 px-4'>
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{product.avgRating}</span>
                      </span>
                    </TableCell>
                    <TableCell className='text-right py-4 px-4'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isPublished ? 'نعم' : 'لا'}
                      </span>
                    </TableCell>
                    <TableCell className='text-right py-4 px-4 text-sm text-gray-600'>
                      {formatDateTime(product.updatedAt)?.dateTime || 'غير متوفر'}
                    </TableCell>
                    <TableCell className='py-4 px-4'>
                      <div className='flex flex-row gap-2 items-center'>
                        <Button asChild variant='default' size='sm'>
                          <Link href={`/admin/products/${product.id}`}>تعديل</Link>
                        </Button>
                        <Button asChild variant='secondary' size='sm'>
                          <Link target='_blank' href={`/product/${product.slug}`}>
                            عرض
                          </Link>
                        </Button>
                        <DeleteDialog
                          id={product.id}
                          action={deleteProductClient}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className='md:hidden space-y-4'>
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                {/* Product Header with Image and Name */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                    <Image
                      src={product.images[0] || '/images/placeholder.jpg'}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/products/${product.id}`} className="text-orange-600 hover:text-orange-800 hover:underline font-medium text-lg block">
                      {product.name}
                    </Link>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">السعر:</span>
                    <span className="font-semibold text-green-700">{product.price.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">المخزون:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.countInStock > 10 ? 'bg-green-100 text-green-800' : 
                      product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.countInStock}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">التقييم:</span>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{product.avgRating}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">منشور:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isPublished ? 'نعم' : 'لا'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">آخر تحديث:</span>
                    <span className="text-sm text-gray-600">
                      {formatDateTime(product.updatedAt)?.dateTime || 'غير متوفر'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 pt-3 flex gap-2">
                  <Button asChild variant='default' size='sm' className="flex-1">
                    <Link href={`/admin/products/${product.id}`}>
                      تعديل
                    </Link>
                  </Button>
                  <Button asChild variant='secondary' size='sm' className="flex-1">
                    <Link target='_blank' href={`/product/${product.slug}`}>
                      عرض
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={product.id}
                    action={deleteProductClient}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد منتجات
            </div>
          )}
        </div>
          
        {/* Pagination - only show when there are multiple pages */}
        {totalPages > 1 && (
          <div className='flex items-center gap-2 mt-4'>
            <Button
              variant='outline'
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className='w-24'
            >
              <ChevronRight /> السابق
            </Button>
            صفحة {page} من {totalPages}
            <Button
              variant='outline'
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className='w-24'
            >
              التالي <ChevronLeft />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
