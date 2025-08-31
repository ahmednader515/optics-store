import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import ServerPagination from '@/components/shared/server-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getMyOrders } from '@/lib/actions/order.actions'
import { IOrderList } from '@/types'
import { formatDateTime, formatId } from '@/lib/utils'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'

const PAGE_TITLE = 'طلباتك'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

// Loading skeleton components
function OrdersTableSkeleton() {
  return (
    <div className='overflow-x-auto'>
      <div className='h-10 bg-gray-200 rounded w-full mb-4 animate-pulse'></div>
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='h-12 bg-gray-200 rounded w-full animate-pulse'></div>
        ))}
      </div>
    </div>
  )
}

function BrowsingHistorySkeleton() {
  return (
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
  )
}

// Async components for progressive loading
async function OrdersTable({ page }: { page: number }) {
  const orders = await getMyOrders({ page })

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-right'>التاريخ</TableHead>
            <TableHead className='text-right'>المجموع</TableHead>
            <TableHead className='text-right'>مدفوع</TableHead>
            <TableHead className='text-right'>مُسلم</TableHead>
            <TableHead className='text-right'>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className=''>
                ليس لديك طلبات.
              </TableCell>
            </TableRow>
          )}
          {orders.data.map((order: IOrderList) => (
            <TableRow key={order.id}>
              <TableCell>
                {formatDateTime(order.createdAt).dateTime}
              </TableCell>
              <TableCell>
                <ProductPrice price={order.totalPrice} plain />
              </TableCell>
              <TableCell>
                {order.isPaid && order.paidAt
                  ? formatDateTime(order.paidAt).dateTime
                  : 'لا'}
              </TableCell>
              <TableCell>
                {order.isDelivered && order.deliveredAt
                  ? formatDateTime(order.deliveredAt).dateTime
                  : 'لا'}
              </TableCell>
              <TableCell>
                <Link href={`/account/orders/${order.id}`}>
                  <span className='px-2'>التفاصيل</span>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {orders.totalPages > 1 && (
        <ServerPagination 
          currentPage={page} 
          totalPages={orders.totalPages}
          baseUrl="/account/orders"
          searchParams={{ page: page.toString() }}
        />
      )}
    </div>
  )
}

async function BrowsingHistorySection() {
  return (
    <div className='mt-16'>
      <BrowsingHistoryList />
    </div>
  )
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1

  return (
    <div>
      <div className='flex gap-2'>
        <Link href='/account'>حسابك</Link>
        <span>›</span>
        <span>{PAGE_TITLE}</span>
      </div>
      <h1 className='h1-bold pt-4'>{PAGE_TITLE}</h1>
      
      {/* Orders Table - Load first */}
      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTable page={page} />
      </Suspense>

      {/* Browsing History - Load second */}
      <Suspense fallback={<BrowsingHistorySkeleton />}>
        <BrowsingHistorySection />
      </Suspense>
    </div>
  )
}
