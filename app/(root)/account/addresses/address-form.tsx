'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
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
import { ShippingAddressSchema, ShippingAddress } from '@/lib/validator'
import { createAddress, updateAddress } from '@/lib/actions/address.actions'

interface AddressFormProps {
  mode: 'create' | 'edit'
  addressIndex?: number
}

const countries = [
  'مصر',
  'السعودية',
  'الإمارات',
  'الكويت',
  'قطر',
  'البحرين',
  'عمان',
  'الأردن',
  'لبنان',
  'سوريا',
  'العراق',
  'فلسطين',
  'اليمن',
  'السودان',
  'المغرب',
  'الجزائر',
  'تونس',
  'ليبيا',
  'موريتانيا',
  'الصومال',
  'جيبوتي',
  'جزر القمر',
  'أخرى'
]

const provinces = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'بني سويف',
  'المنيا',
  'الفيوم',
  'الوادي الجديد',
  'البحر الأحمر',
  'شمال سيناء',
  'جنوب سيناء',
  'مطروح',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'الشرقية',
  'الدقهلية',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'أخرى'
]

export default function AddressForm({ mode, addressIndex }: AddressFormProps) {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof ShippingAddressSchema>>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: {
      fullName: '',
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'مصر',
      phone: '',
    },
  })

  useEffect(() => {
    if (mode === 'edit' && addressIndex !== undefined && session?.user?.addresses) {
      const address = session.user.addresses[addressIndex]
      if (address) {
        form.reset(address)
      }
    }
  }, [mode, addressIndex, session, form])

  const onSubmit = async (values: z.infer<typeof ShippingAddressSchema>) => {
    setLoading(true)
    try {
      let result
      
      if (mode === 'create') {
        result = await createAddress(values)
      } else {
        result = await updateAddress(addressIndex!, values)
      }

      if (result.success) {
        toast({
          description: result.message,
        })

        // Update session with new addresses
        const currentAddresses = session?.user?.addresses || []
        let newAddresses
        
        if (mode === 'create') {
          newAddresses = [...currentAddresses, { ...values, isDefault: currentAddresses.length === 0 }]
        } else {
          newAddresses = currentAddresses.map((addr, i) => 
            i === addressIndex ? { ...values, isDefault: addr.isDefault } : addr
          )
        }

        const newSession = {
          ...session,
          user: {
            ...session?.user,
            addresses: newAddresses,
          },
        }
        await update(newSession)

        // Update local storage
        localStorage.setItem('userAddresses', JSON.stringify(newAddresses))

        router.push('/account/addresses')
      } else {
        toast({
          variant: 'destructive',
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'حدث خطأ أثناء حفظ العنوان',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='fullName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم الكامل *</FormLabel>
                <FormControl>
                  <Input placeholder='أدخل الاسم الكامل' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف *</FormLabel>
                <FormControl>
                  <Input placeholder='أدخل رقم الهاتف' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='street'
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان *</FormLabel>
              <FormControl>
                <Input placeholder='أدخل العنوان بالتفصيل' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>المدينة *</FormLabel>
                <FormControl>
                  <Input placeholder='أدخل المدينة' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='province'
            render={({ field }) => (
              <FormItem>
                <FormLabel>المحافظة *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500'
                  >
                    <option value=''>اختر المحافظة</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='postalCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرمز البريدي *</FormLabel>
                <FormControl>
                  <Input placeholder='أدخل الرمز البريدي' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>البلد *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500'
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex gap-4 pt-4'>
          <Button
            type='submit'
            disabled={loading}
            className='flex-1'
          >
            {loading ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة العنوان' : 'حفظ التغييرات'}
          </Button>
          
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/account/addresses')}
            className='flex-1'
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  )
}
