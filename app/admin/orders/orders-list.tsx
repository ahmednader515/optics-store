'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
import ProductPrice from '@/components/shared/product/product-price'
import DeleteDialog from '@/components/shared/delete-dialog'
import { useToast } from '@/hooks/use-toast'

type Order = {
  id: string
  createdAt: Date
  totalPrice: number
  isPaid: boolean
  isDelivered: boolean
  user: {
    name: string
    phone: string
  }
}

type OrdersListProps = {
  orders: Order[]
  totalPages: number
  currentPage: number
}

export default function OrdersList({ orders, totalPages, currentPage }: OrdersListProps) {
  const { toast } = useToast()

  const handleDeleteOrder = async (id: string) => {
    try {
      // Call the API route to delete the order
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'تم حذف الطلب بنجاح',
          description: result.message,
        })
        // Refresh the page to show updated data
        window.location.reload()
        return { success: true, message: result.message }
      } else {
        toast({
          title: 'خطأ في حذف الطلب',
          description: result.message || 'حدث خطأ غير متوقع',
          variant: 'destructive',
        })
        return { success: false, message: result.message || 'حدث خطأ غير متوقع' }
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: 'خطأ في حذف الطلب',
        description: 'حدث خطأ غير متوقع أثناء حذف الطلب',
        variant: 'destructive',
      })
      return { success: false, message: 'حدث خطأ أثناء الحذف' }
    }
  }

  return (
    <div className='space-y-4 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <h1 className='h1-bold'>الطلبات</h1>
      
      {/* Desktop Table - Hidden on mobile */}
      <div className='hidden md:block overflow-x-auto'>
        <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>التاريخ</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>المشتري</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>المجموع</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>مدفوع</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>مُسلم</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-b border-gray-200">
                <TableCell className='py-4 px-4'>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div>
                    <div className='font-medium'>{order.user.name}</div>
                    <div className='text-sm text-gray-500'>{order.user.phone}</div>
                  </div>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <ProductPrice price={order.totalPrice} />
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    order.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.isPaid ? 'مدفوع' : 'غير مدفوع'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    order.isDelivered 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.isDelivered ? 'مُسلم' : 'قيد التوصيل'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <div className='flex gap-2'>
                    <Button asChild size='sm'>
                      <Link href={`/admin/orders/${order.id}`}>
                        عرض التفاصيل
                      </Link>
                    </Button>
                    <DeleteDialog
                      id={order.id}
                      action={handleDeleteOrder}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - Visible only on mobile */}
      <div className='md:hidden space-y-4'>
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {formatDateTime(order.createdAt).dateTime}
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  order.isPaid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {order.isPaid ? 'مدفوع' : 'غير مدفوع'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  order.isDelivered 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.isDelivered ? 'مُسلم' : 'قيد التوصيل'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t border-gray-100 pt-3">
              <div className="font-medium text-gray-900">{order.user.name}</div>
              <div className="text-sm text-gray-500">{order.user.phone}</div>
            </div>

            {/* Order Total */}
            <div className="border-t border-gray-100 pt-3">
              <div className="text-sm text-gray-600 mb-1">المجموع:</div>
              <div className="text-lg font-semibold text-green-600">
                <ProductPrice price={order.totalPrice} />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-3 flex gap-2">
              <Button asChild size='sm' className="flex-1">
                <Link href={`/admin/orders/${order.id}`}>
                  عرض التفاصيل
                </Link>
              </Button>
              <DeleteDialog
                id={order.id}
                action={handleDeleteOrder}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Simple pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          {currentPage > 1 && (
            <Button asChild variant="outline">
              <Link href={`/admin/orders?page=${currentPage - 1}`}>
                السابق
              </Link>
            </Button>
          )}
          
          <span className="text-sm text-gray-600">
            صفحة {currentPage} من {totalPages}
          </span>
          
          {currentPage < totalPages && (
            <Button asChild variant="outline">
              <Link href={`/admin/orders?page=${currentPage + 1}`}>
                التالي
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
