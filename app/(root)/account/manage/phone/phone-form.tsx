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
import PhoneInput from '@/components/shared/phone-input'
import { useToast } from '@/hooks/use-toast'
import { updateUserPhone } from '@/lib/actions/user.actions'

const PhoneSchema = z.object({
  phone: z.string().min(1, 'رقم الهاتف مطلوب').regex(/^\+?[1-9]\d{1,14}$/, 'رقم الهاتف غير صحيح'),
})

export const PhoneForm = () => {
  const router = useRouter()
  const { data: session, update } = useSession()
  const form = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: {
      phone: session?.user?.phone ?? '',
    },
  })
  const { toast } = useToast()

  async function onSubmit(values: z.infer<typeof PhoneSchema>) {
    try {
      const res = await updateUserPhone(values)
      
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
      
      // Update session with new phone number
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          phone: values.phone,
        },
      }
      await update(newSession)
      
      router.push('/account/manage')
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'حدث خطأ أثناء تحديث رقم الهاتف',
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
            name='phone'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='font-bold'>رقم الهاتف الجديد</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='أدخل رقم الهاتف'
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
