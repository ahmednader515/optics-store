import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PasswordForm } from './password-form'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import data from '@/lib/data'

export const metadata: Metadata = {
  title: 'تغيير كلمة المرور',
}

export default async function ManagePasswordPage() {
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
        <span>تغيير كلمة المرور</span>
      </div>
      <h1 className='h1-bold py-4'>تغيير كلمة المرور</h1>
      <Card className='max-w-2xl'>
        <CardContent className='p-4 flex justify-between flex-wrap'>
          <p className='text-sm py-2'>
            إذا كنت تريد تغيير كلمة المرور لحسابك في {site.name}،
            يمكنك القيام بذلك أدناه. تأكد من النقر على زر حفظ
            التغييرات عندما تنتهي.
          </p>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
