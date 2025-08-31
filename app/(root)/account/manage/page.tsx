import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const PAGE_TITLE = 'تسجيل الدخول والأمان'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}
export default async function ProfilePage() {
  const session = await auth()
  
  // Debug: Log session data to see what's available
  console.log('Session data:', {
    userId: session?.user?.id,
    userName: session?.user?.name,
    userPhone: session?.user?.phone,
    userRole: session?.user?.role,
    fullSession: session
  })
  
  return (
    <div className='mb-24'>
      <SessionProvider session={session}>
        <div className='flex gap-2 '>
          <Link href='/account'>حسابك</Link>
          <span>›</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
        <Card className='max-w-2xl '>
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>الاسم</h3>
              <p>{session?.user.name}</p>
            </div>
            <div>
              <Link href='/account/manage/name'>
                <Button className='rounded-full w-32' variant='outline'>
                  تعديل
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>رقم الهاتف</h3>
              <p>{session?.user.phone || 'غير محدد'}</p>
            </div>
            <div>
              <Link href='/account/manage/phone'>
                <Button className='rounded-full w-32' variant='outline'>
                  تعديل
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>كلمة المرور</h3>
              <p>************</p>
            </div>
            <div>
              <Link href='/account/manage/password'>
                <Button className='rounded-full w-32' variant='outline'>
                  تعديل
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}
