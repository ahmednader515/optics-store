'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import useCartStore from '@/hooks/use-cart-store'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'
import { useLoading } from '@/hooks/use-loading'
import { LoadingSpinner } from '@/components/shared/loading-overlay'

export default function CartPage() {
  const { cart: { items, itemsPrice }, updateItem, removeItem, clearCart } = useCartStore()
  const { isLoading: isUpdating, withLoading } = useLoading()

  const handleQuantityChange = async (item: any, newQuantity: number) => {
    if (newQuantity < 1) return
    
    await withLoading(
      async () => {
        updateItem(item, newQuantity)
      }
    )
  }

  const handleRemoveItem = async (item: any) => {
    await withLoading(
      async () => {
        removeItem(item)
        toast({
          title: 'تم حذف المنتج',
          description: 'تم حذف المنتج من عربة التسوق',
          variant: 'default',
        })
      }
    )
  }

  const handleClearCart = async () => {
    await withLoading(
      async () => {
        clearCart()
        toast({
          title: 'تم إفراغ العربة',
          description: 'تم حذف جميع المنتجات من عربة التسوق',
          variant: 'default',
        })
      }
    )
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-6 sm:py-8' dir='rtl'>
        <div className='text-center py-8 sm:py-12'>
          <ShoppingCart className='h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4' />
          <h1 className='text-xl sm:text-2xl font-bold mb-2'>عربة التسوق فارغة</h1>
          <p className='text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4'>
            يبدو أنك لم تضيف أي منتجات إلى عربة التسوق بعد.
          </p>
          <Button asChild size='lg' className='btn-mobile-lg'>
            <Link href='/'>ابدأ التسوق</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-6 sm:py-8' dir='rtl'>
      <div className='flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/'>
            <ArrowLeft className='h-4 w-4 ml-2' />
            متابعة التسوق
          </Link>
        </Button>
        <h1 className='text-2xl sm:text-3xl font-bold'>عربة التسوق</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
        <div className='lg:col-span-2 space-y-3 sm:space-y-4'>
          {items.map((item) => (
            <Card key={item.clientId}>
              <CardContent className='p-3 sm:p-4'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
                  <div className='relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className='object-cover rounded'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-sm sm:text-base mb-1'>{item.name}</h3>
                    <p className='text-xs sm:text-sm text-muted-foreground mb-2'>
                      {item.color && `اللون: ${item.color}`}
                      {item.color && item.size && ` | `}
                      {item.size && `الحجم: ${item.size}`}
                    </p>
                    <p className='font-medium text-sm sm:text-base mb-3 sm:mb-0'>
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating}
                      className='h-8 w-8 sm:h-9 sm:w-9 p-0'
                    >
                      -
                    </Button>
                    <span className='w-8 sm:w-12 text-center text-sm sm:text-base'>{item.quantity}</span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      disabled={isUpdating}
                      className='h-8 w-8 sm:h-9 sm:w-9 p-0'
                    >
                      +
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemoveItem(item)}
                      disabled={isUpdating}
                      className='text-destructive h-8 w-8 sm:h-9 sm:w-9 p-0'
                    >
                      {isUpdating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className='space-y-3 sm:space-y-4'>
          <Card>
            <CardHeader className='p-3 sm:p-4 pb-2 sm:pb-3'>
              <CardTitle className='text-base sm:text-lg'>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className='p-3 sm:p-4 pt-0 space-y-2'>
              <div className='flex justify-between text-sm sm:text-base'>
                <span>المنتجات ({items.length})</span>
                <span>{formatPrice(itemsPrice)}</span>
              </div>
              <Separator />
              <div className='flex justify-between font-semibold text-base sm:text-lg'>
                <span>المجموع</span>
                <span>{formatPrice(itemsPrice)}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className='space-y-2'>
            <Button asChild className='w-full' size='lg' className='btn-mobile-lg'>
              <Link href='/checkout'>إتمام الطلب</Link>
            </Button>
            <Button
              variant='outline'
              onClick={handleClearCart}
              disabled={isUpdating}
              className='w-full btn-mobile'
            >
              {isUpdating ? (
                <LoadingSpinner size="sm" text="جاري الإفراغ..." />
              ) : (
                'إفراغ العربة'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
