import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { Card, CardContent } from '@/components/ui/card'
import { Home, PackageCheckIcon, User } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import React, { Suspense } from 'react'

const PAGE_TITLE = 'حسابك'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

// Loading skeleton components
function AccountCardsSkeleton() {
  return (
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
async function AccountCards() {
  return (
    <div className='grid md:grid-cols-3 gap-4 items-stretch'>
      <Card>
        <Link href='/account/orders'>
          <CardContent className='flex items-start gap-4 p-6'>
            <div>
              <PackageCheckIcon className='w-12 h-12' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>الطلبات</h2>
              <p className='text-muted-foreground'>
                تتبع، إرجاع، إلغاء طلب، تحميل الفاتورة أو الشراء مرة أخرى
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card>
        <Link href='/account/manage'>
          <CardContent className='flex items-start gap-4 p-6'>
            <div>
              <User className='w-12 h-12' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>تسجيل الدخول والأمان</h2>
              <p className='text-muted-foreground'>
                إدارة كلمة المرور والبريد الإلكتروني ورقم الهاتف
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card>
        <Link href='/account/addresses'>
          <CardContent className='flex items-start gap-4 p-6'>
            <div>
              <Home className='w-12 h-12' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>العناوين</h2>
              <p className='text-muted-foreground'>
                تعديل، إزالة أو تعيين العنوان الافتراضي
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
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

export default function AccountPage() {
  return (
    <div>
      <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
      
      {/* Account Cards - Load first */}
      <Suspense fallback={<AccountCardsSkeleton />}>
        <AccountCards />
      </Suspense>
      
      {/* Browsing History - Load second */}
      <Suspense fallback={<BrowsingHistorySkeleton />}>
        <BrowsingHistorySection />
      </Suspense>
    </div>
  )
}
