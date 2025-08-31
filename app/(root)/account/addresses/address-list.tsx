'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Edit, Trash2, Star, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ShippingAddress } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { deleteAddress, setDefaultAddress } from '@/lib/actions/address.actions'

export default function AddressList() {
  const { data: session, update } = useSession()
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load addresses from session or local storage
    if (session?.user?.addresses) {
      setAddresses(session.user.addresses)
    } else {
      // Load from local storage as fallback
      const savedAddresses = localStorage.getItem('userAddresses')
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses))
      }
    }
    setLoading(false)
  }, [session])

  const handleDeleteAddress = async (index: number) => {
    try {
      const addressToDelete = addresses[index]
      const res = await deleteAddress(addressToDelete)
      
      if (res.success) {
        const newAddresses = addresses.filter((_, i) => i !== index)
        setAddresses(newAddresses)
        
        // Update session
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
        
        toast({
          description: 'تم حذف العنوان بنجاح',
        })
      } else {
        toast({
          variant: 'destructive',
          description: res.message || 'حدث خطأ أثناء حذف العنوان',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'حدث خطأ أثناء حذف العنوان',
      })
    }
  }

  const handleSetDefault = async (index: number) => {
    try {
      const addressToSetDefault = addresses[index]
      const res = await setDefaultAddress(addressToSetDefault)
      
      if (res.success) {
        const newAddresses = addresses.map((addr, i) => ({
          ...addr,
          isDefault: i === index
        }))
        setAddresses(newAddresses)
        
        // Update session
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
        
        toast({
          description: 'تم تعيين العنوان كافتراضي بنجاح',
        })
      } else {
        toast({
          variant: 'destructive',
          description: res.message || 'حدث خطأ أثناء تعيين العنوان الافتراضي',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'حدث خطأ أثناء تعيين العنوان الافتراضي',
      })
    }
  }

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='animate-pulse'>
          <div className='h-32 bg-gray-200 rounded-lg'></div>
        </div>
        <div className='animate-pulse'>
          <div className='h-32 bg-gray-200 rounded-lg'></div>
        </div>
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className='p-8 text-center'>
          <MapPin className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>لا توجد عناوين</h3>
          <p className='text-muted-foreground mb-4'>
            لم تقم بإضافة أي عناوين شحن بعد. أضف عنوانك الأول للبدء.
          </p>
          <Button asChild>
            <Link href='/account/addresses/create'>
              <Plus className='h-4 w-4 ml-2' />
              إضافة عنوان جديد
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {addresses.map((address, index) => (
        <Card key={index} className={`${address.isDefault ? 'ring-2 ring-orange-500' : ''}`}>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <h3 className='font-semibold'>{address.fullName}</h3>
                  {address.isDefault && (
                    <span className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full'>
                      <Star className='h-3 w-3' />
                      افتراضي
                    </span>
                  )}
                </div>
                <div className='text-sm text-muted-foreground space-y-1' dir="rtl">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.province} {address.postalCode}</p>
                  <p>{address.country}</p>
                  <p className='mt-2'>📞 {address.phone}</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {!address.isDefault && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleSetDefault(index)}
                  >
                    <Star className='h-4 w-4 ml-1' />
                    تعيين كافتراضي
                  </Button>
                )}
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/account/addresses/edit/${index}`}>
                    <Edit className='h-4 w-4 ml-1' />
                    تعديل
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleDeleteAddress(index)}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
