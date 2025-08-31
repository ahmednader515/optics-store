'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import data from '@/lib/data'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignUp } from '@/types'
import { registerUser, signInWithCredentials } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { useState } from 'react'
import PhoneInput from '@/components/shared/phone-input'

const signUpDefaultValues = {
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

export default function SignUpForm() {
  const { site } = data.settings[0];
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignUp) => {
    if (isSubmitting) return // Prevent double submission
    
    setIsSubmitting(true)
    
    try {
      const res = await registerUser(data)
      if (!res.success) {
        // Handle specific error cases with descriptive messages
        let errorMessage = 'فشل في إنشاء الحساب'
        
        if (res.error) {
          if (res.error.includes('already exists')) {
            errorMessage = 'يوجد حساب بهذا الرقم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.'
          } else if (res.error.includes('validation')) {
            errorMessage = 'يرجى التحقق من إدخالك والمحاولة مرة أخرى.'
          } else {
            errorMessage = res.error
          }
        }
        
        toast({
          title: 'فشل التسجيل',
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }
      
      // Show success message
      toast({
        title: 'تم إنشاء الحساب بنجاح!',
        description: 'تم إنشاء حسابك. جاري تسجيل دخولك...',
        variant: 'default',
      })
      
      // If user creation is successful, sign them in
      const signInResult = await signInWithCredentials({
        phone: data.phone,
        password: data.password,
      })
      
      if (signInResult?.error) {
        toast({
          title: 'تم إنشاء الحساب',
          description: 'تم إنشاء الحساب بنجاح، لكن فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول يدوياً.',
          variant: 'default',
        })
        // Redirect to sign in page
        router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`)
        return
      }
      
      // Successfully signed in, redirect
      router.push(callbackUrl)
    } catch (error) {
      console.error('Signup error:', error)
      
      // Handle different types of errors
      let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.'
        } else if (error.message.includes('validation')) {
          errorMessage = 'يرجى التحقق من إدخالك والمحاولة مرة أخرى.'
        }
      }
      
      toast({
        title: 'خطأ في التسجيل',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="font-cairo">
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-6 md:space-y-8'>
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-right block font-cairo text-gray-700 text-base md:text-lg mb-2 md:mb-3">الاسم</FormLabel>
                <FormControl>
                  <Input 
                    placeholder='أدخل اسمك' 
                    {...field} 
                    className="text-right font-cairo h-10 md:h-12 text-base md:text-lg px-3 md:px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='phone'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-right block font-cairo text-gray-700 text-base md:text-lg mb-2 md:mb-3">رقم الهاتف</FormLabel>
                <FormControl>
                  <PhoneInput 
                    placeholder='أدخل رقم الهاتف' 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    className="text-right font-cairo h-10 md:h-12 text-base md:text-lg px-3 md:px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-right block font-cairo text-gray-700 text-base md:text-lg mb-2 md:mb-3">كلمة المرور</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='أدخل كلمة المرور'
                    {...field}
                    className="text-right font-cairo h-10 md:h-12 text-base md:text-lg px-3 md:px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-right block font-cairo text-gray-700 text-base md:text-lg mb-2 md:mb-3">تأكيد كلمة المرور</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='أعد إدخال كلمة المرور'
                    {...field}
                    className="text-right font-cairo h-10 md:h-12 text-base md:text-lg px-3 md:px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-3 md:pt-4">
            <Button type='submit' disabled={isSubmitting} className="w-full font-cairo h-10 md:h-12 text-base md:text-lg">
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>
          </div>
          
          <div className='text-sm md:text-base text-right text-gray-600 font-cairo leading-relaxed'>
            عند إنشاء الحساب، فإنك توافق على{' '}
            <Link href='/page/conditions-of-use' className="text-orange-600 hover:underline">شروط الاستخدام</Link> و{' '}
<Link href='/page/privacy-policy' className="text-orange-600 hover:underline">سياسة الخصوصية</Link> الخاصة بـ {site.name}.
          </div>
        </div>
      </form>
    </Form>
  )
}
