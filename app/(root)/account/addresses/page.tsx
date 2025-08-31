import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Edit, Trash2, Star } from 'lucide-react'
import AddressList from './address-list'

export const metadata: Metadata = {
  title: 'إدارة العناوين',
}

export default async function AddressesPage() {
  const session = await auth()
  if (!session) redirect('/sign-in')
  
  return (
    <div className='mb-24'>
      <div className='flex gap-2 '>
        <Link href='/account'>حسابك</Link>
        <span>›</span>
        <span>العناوين</span>
      </div>
      <h1 className='h1-bold py-4'>إدارة العناوين</h1>
      
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-800'>عناوين التوصيل</h2>
            <p className='text-sm text-muted-foreground'>
              قم بإدارة عناوين التوصيل الخاصة بك
            </p>
          </div>
          <Button asChild>
            <Link href='/account/addresses/create'>
              <Plus className='h-4 w-4 ml-2' />
              إضافة عنوان جديد
            </Link>
          </Button>
        </div>
        
        <AddressList />
      </div>
    </div>
  )
}
