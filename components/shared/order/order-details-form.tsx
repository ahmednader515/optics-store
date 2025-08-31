'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IOrderList } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import { deliverOrder, updateOrderToPaid } from '@/lib/actions/order.actions'

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrderList
  isAdmin: boolean
}) {
  const {
    shippingAddress,
    items,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
  } = order

  // Add safety checks for required properties
  if (!order) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        الطلب غير موجود
      </div>
    )
  }

  if (!shippingAddress) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        عنوان التوصيل غير متوفر
      </div>
    )
  }

  // Use items or orderItems, whichever is available
  const orderItemsList = items || orderItems || []
  
  // Debug logging
  console.log('Order data received:', order)
  console.log('Items:', items)
  console.log('OrderItems:', orderItems)
  console.log('OrderItemsList:', orderItemsList)
  console.log('ShippingAddress:', shippingAddress)
  
  if (orderItemsList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        لا توجد منتجات في الطلب
        <br />
        <small className="text-xs mt-2">
          Items: {items?.length || 0}, OrderItems: {orderItems?.length || 0}
        </small>
      </div>
    )
  }

  return (
    <div className='grid md:grid-cols-3 md:gap-5' dir='rtl'>
      <div className='overflow-x-auto md:col-span-2 space-y-4'>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>عنوان التوصيل</h2>
            <p>
              {shippingAddress.street} <br />
              {shippingAddress.building && `${shippingAddress.building}, `}
              {shippingAddress.apartment && `${shippingAddress.apartment}, `}
              {shippingAddress.floor && `${shippingAddress.floor}, `}
              {`${shippingAddress.area || 'غير متوفر'}, ${shippingAddress.province || 'غير متوفر'}`}
              {shippingAddress.landmark && <><br />{shippingAddress.landmark}</>}
            </p>

            {isDelivered ? (
              <Badge>
                تم التوصيل في {deliveredAt ? formatDateTime(deliveredAt).dateTime : 'غير محدد'}
              </Badge>
            ) : (
              <div>
                {' '}
                <Badge variant='destructive'>لم يتم التوصيل بعد</Badge>
                <div className='mt-2'>
                  <strong>موعد التوصيل المتوقع:</strong> <br />
                  {expectedDeliveryDate ? formatDateTime(expectedDeliveryDate).dateTime : 'غير محدد'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>طريقة الدفع</h2>
            <p>{paymentMethod || 'غير محدد'}</p>
            {isPaid ? (
              <Badge>تم الدفع في {paidAt ? formatDateTime(paidAt).dateTime : 'غير محدد'}</Badge>
            ) : (
              <Badge variant='destructive'>لم يتم الدفع بعد</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>تفاصيل الطلب</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-right'>المنتج</TableHead>
                  <TableHead className='text-right'>الكمية</TableHead>
                  <TableHead className='text-right'>السعر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItemsList.map((item, index) => (
                  <TableRow key={item.slug || item.productId || `item-${index}`}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug || '#'}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image || '/placeholder-image.jpg'}
                          alt={item.name || 'Product'}
                          width={50}
                          height={50}
                        ></Image>
                        <span className='px-2'>{item.name || 'منتج غير معروف'}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.quantity || 0}</span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <ProductPrice price={item.price || 0} plain />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className='p-4 space-y-4 gap-4'>
            <h2 className='text-xl pb-4'>ملخص الطلب</h2>
            <div className='flex justify-between'>
              <div>المنتجات</div>
              <div>
                {' '}
                <ProductPrice price={itemsPrice || 0} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>الضريبة</div>
              <div>
                {' '}
                <ProductPrice price={taxPrice || 0} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>التوصيل</div>
              <div>
                {' '}
                <ProductPrice price={shippingPrice || 0} plain />
              </div>
            </div>
            <div className='flex justify-between font-bold text-lg'>
              <div>المجموع الكلي</div>
              <div>
                {' '}
                <ProductPrice price={totalPrice || 0} plain />
              </div>
            </div>

            {isAdmin && !isPaid && paymentMethod === 'دفع عند الاستلام' && (
              <ActionButton
                caption='تحديد كمدفوع'
                action={() => updateOrderToPaid(order.id)}
              />
            )}
            {isAdmin && isPaid && !isDelivered && (
              <ActionButton
                caption='تحديد كمُسلم'
                action={() => deliverOrder(order.id)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
