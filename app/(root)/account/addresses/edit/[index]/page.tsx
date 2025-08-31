import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AddressForm from '../../address-form'

export const metadata: Metadata = {
  title: 'تعديل العنوان',
}

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ index: string }>
}) {
  const session = await auth()
  if (!session) redirect('/sign-in')
  
  const { index } = await params
  const addressIndex = parseInt(index)
  
  if (isNaN(addressIndex)) {
    redirect('/account/addresses')
  }
  
  return (
    <div className='mb-24'>
      <div className='flex gap-2 '>
        <Link href='/account'>حسابك</Link>
        <span>›</span>
        <Link href='/account/addresses'>العناوين</Link>
        <span>›</span>
        <span>تعديل العنوان</span>
      </div>
      
      <div className='flex items-center gap-4 mb-6'>
        <Button asChild variant='ghost' size='sm'>
          <Link href='/account/addresses'>
            <ArrowLeft className='h-4 w-4 ml-1' />
            العودة للعناوين
          </Link>
        </Button>
        <h1 className='h1-bold'>تعديل العنوان</h1>
      </div>
      
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>تعديل معلومات العنوان</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressForm mode='edit' addressIndex={addressIndex} />
        </CardContent>
      </Card>
    </div>
  )
}
