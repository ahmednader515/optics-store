'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { updateUserPassword } from '@/lib/actions/user.actions'

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(3, 'كلمة المرور الجديدة يجب أن تكون 3 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ['confirmPassword'],
})

export const PasswordForm = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const form = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const { toast } = useToast()

  async function onSubmit(values: z.infer<typeof PasswordSchema>) {
    try {
      const res = await updateUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
        return
      }
      
      toast({
        description: res.message,
      })
      
      router.push('/account/manage')
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'حدث خطأ أثناء تغيير كلمة المرور',
      })
    }
  }
  
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-5'
      >
        <div className='flex flex-col gap-5'>
          <FormField
            control={form.control}
            name='currentPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='font-bold'>كلمة المرور الحالية</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='أدخل كلمة المرور الحالية'
                    {...field}
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='font-bold'>كلمة المرور الجديدة</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='أدخل كلمة المرور الجديدة'
                    {...field}
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='font-bold'>تأكيد كلمة المرور الجديدة</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='أعد إدخال كلمة المرور الجديدة'
                    {...field}
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          size='lg'
          disabled={form.formState.isSubmitting}
          className='button col-span-2 w-full'
        >
          {form.formState.isSubmitting ? 'جاري الإرسال...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  )
}
