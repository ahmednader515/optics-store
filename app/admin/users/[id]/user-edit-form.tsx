'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { updateUser } from '@/lib/actions/user.actions'
import { USER_ROLES } from '@/lib/constants'
import { IUserInput } from '@/types'
import { UserUpdateSchema } from '@/lib/validator'

const UserEditForm = ({ user }: { user: IUserInput & { id: string } }) => {
  const router = useRouter()

  console.log('UserEditForm rendered with user:', user)

  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      _id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  })

  const { toast } = useToast()
  
  // Debug form state
  useEffect(() => {
    console.log('Form state:', {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      values: form.getValues(),
      isSubmitting: form.formState.isSubmitting
    })
  }, [form, form.formState.isValid, form.formState.errors, form.formState.isSubmitting])

  async function onSubmit(values: z.infer<typeof UserUpdateSchema>) {
    console.log('Form submitted with values:', values)
    try {
      const res = await updateUser({
        ...values,
        _id: user.id,
      })
      console.log('Update response:', res)
      if (!res.success)
        return toast({
          variant: 'destructive',
          description: res.message,
        })

      toast({
        description: res.message,
      })
      form.reset()
      router.push(`/admin/users`)
    } catch (error) {
      console.error('Error updating user:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast({
        variant: 'destructive',
        description: errorMessage,
      })
    }
  }

  return (
    <Form {...form}>
      <div className='space-y-8'>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter user name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder='Enter user phone' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem className='space-x-2 items-center'>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex-between'>
          <Button 
            type='button' 
            disabled={form.formState.isSubmitting}
            onClick={() => {
              const values = form.getValues()
              console.log('Button clicked, calling onSubmit with values:', values)
              onSubmit(values)
            }}
          >
            {form.formState.isSubmitting ? 'Submitting...' : `Update User`}
          </Button>
          <Button
            variant='outline'
            type='button'
            onClick={() => router.push(`/admin/users`)}
          >
            Back
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default UserEditForm
