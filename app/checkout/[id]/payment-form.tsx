'use client'

import { Card, CardContent } from '@/components/ui/card'
import { IOrderList } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

import CheckoutFooter from '../checkout-footer'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'


export default function OrderDetailsForm({
  order,
}: {
  order: IOrderList
}) {
  const router = useRouter()
  // Handle both mock data and database data structures
  const shippingAddress = order.shippingAddress
  const items = order.items || []
  const {
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order
  const { toast } = useToast()

  if (isPaid) {
    redirect(`/account/orders/${order.id}`)
  }


  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        <div>
          <div className='text-lg font-bold'>ملخص الطلب</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>المنتجات:</span>
              <span>
                {' '}
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between'>
              <span>التوصيل والمعالجة:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'
                ) : shippingPrice === 0 ? (
                  'مجاني'
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>الضريبة:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between  pt-1 font-bold text-lg'>
              <span>المجموع الكلي:</span>
              <span>
                {' '}
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>

            {!isPaid && (paymentMethod === 'دفع عند الاستلام' || paymentMethod === 'الدفع عند الاستلام عن طريق الفيزا') && (
              <Button
                className='w-full rounded-full'
                onClick={() => router.push(`/account/orders/${order.id}`)}
              >
                عرض الطلب
              </Button>
            )}

            {!isPaid && paymentMethod !== 'دفع عند الاستلام' && paymentMethod !== 'الدفع عند الاستلام عن طريق الفيزا' && (
              <div className='text-red-500 text-center p-2'>
                طريقة دفع غير معروفة: {paymentMethod}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Debug: Log order data to console
  console.log('Order data:', order)
  console.log('Shipping address:', shippingAddress)
  console.log('Items:', items)
  console.log('Payment method:', paymentMethod)
  console.log('Is paid:', isPaid)

  return (
    <main className='max-w-6xl mx-auto' dir='rtl'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* Shipping Address */}
          <div>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>عنوان التوصيل</span>
              </div>
              <div className='col-span-2'>
                {shippingAddress ? (
                  <p>
                    {shippingAddress.street || 'غير متوفر'} <br />
                    {shippingAddress.building && `${shippingAddress.building}, `}
                    {shippingAddress.apartment && `${shippingAddress.apartment}, `}
                    {shippingAddress.floor && `${shippingAddress.floor}, `}
                    {`${shippingAddress.area || 'غير متوفر'}, ${shippingAddress.province || 'غير متوفر'}`}
                    {shippingAddress.landmark && <><br />{shippingAddress.landmark}</>}
                  </p>
                ) : (
                  <p>عنوان التوصيل غير متوفر</p>
                )}
              </div>
            </div>
          </div>

          {/* payment method */}
          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>طريقة الدفع</span>
              </div>
              <div className='col-span-2'>
                <p>{paymentMethod || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          <div className='block md:hidden'>
            <CheckoutSummary />
          </div>

          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
