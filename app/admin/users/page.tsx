import { Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import { getAllUsers } from '@/lib/actions/user.actions'
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
import { useLoading } from '@/hooks/use-loading'
import { LoadingSpinner } from '@/components/shared/loading-overlay'

export const metadata: Metadata = {
  title: 'Admin Users',
}

export default async function AdminUser(props: {
  searchParams: Promise<{ page: string }>
}) {
  const { page = '1' } = await props.searchParams
  
  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')
    
  const users = await getAllUsers({
    page: Number(page),
  })
  
  return (
    <div className='space-y-4 rtl text-right' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <h1 className='h1-bold'>المستخدمون</h1>
      
      {/* Desktop Table - Hidden on mobile */}
      <div className='hidden md:block overflow-x-auto'>
        <Table className="admin-table border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الاسم</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>رقم الهاتف</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الدور</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>تاريخ التسجيل</TableHead>
              <TableHead className='text-right bg-gray-100 text-gray-800 font-semibold py-4 px-4'>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.data.map((user) => (
              <TableRow key={user.id} className="border-b border-gray-200">
                <TableCell className='py-4 px-4'>
                  <div>
                    <div className='font-medium'>{user.name}</div>
                    {user.phone && (
                      <div className='text-sm text-gray-500'>{user.phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  {user.phone || 'غير متوفر'}
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {user.role === 'Admin' ? 'مدير' : 'مستخدم'}
                  </span>
                </TableCell>
                <TableCell className='py-4 px-4'>
                  {formatDateTime(user.createdAt).dateTime}
                </TableCell>
                <TableCell className='py-4 px-4'>
                  <Button asChild size='sm'>
                    <Link href={`/admin/users/edit/${user.id}`}>
                      تعديل
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - Visible only on mobile */}
      <div className='md:hidden space-y-4'>
        {users?.data.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            {/* User Header */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-lg text-gray-900">{user.name}</div>
                {user.phone && (
                  <div className="text-sm text-gray-500">{user.phone}</div>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'Admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {user.role === 'Admin' ? 'مدير' : 'مستخدم'}
              </span>
            </div>

            {/* Registration Date */}
            <div className="border-t border-gray-100 pt-3">
              <div className="text-sm text-gray-600 mb-1">تاريخ التسجيل:</div>
              <div className="text-sm text-gray-900">
                {formatDateTime(user.createdAt).dateTime}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-3">
              <Button asChild size='sm' className="w-full">
                <Link href={`/admin/users/edit/${user.id}`}>
                  تعديل
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
