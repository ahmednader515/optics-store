import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import data from '@/lib/data'

export const metadata: Metadata = {
  title: 'إدارة الاسم',
}

export default async function ManageNamePage() {
  const session = await auth()
  if (!session) redirect('/sign-in')
  
  const { site } = data.settings[0];
  
  return (
    <div className='mb-24'>
      <div className='flex gap-2 '>
        <Link href='/account'>حسابك</Link>
        <span>›</span>
        <Link href='/account/manage'>تسجيل الدخول والأمان</Link>
        <span>›</span>
        <span>تغيير اسمك</span>
      </div>
      <h1 className='h1-bold py-4'>تغيير اسمك</h1>
      <Card className='max-w-2xl'>
        <CardContent className='p-4 flex justify-between flex-wrap'>
          <p className='text-sm py-2'>
            إذا كنت تريد تغيير الاسم المرتبط بحسابك في {site.name}،
            يمكنك القيام بذلك أدناه. تأكد من النقر على زر حفظ
            التغييرات عندما تنتهي.
          </p>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  )
}
