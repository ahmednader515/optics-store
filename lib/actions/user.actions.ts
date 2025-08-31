'use server'

import bcrypt from 'bcryptjs'
import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { UserSignUpSchema, UserUpdateSchema } from '../validator'
import { prisma } from '@/lib/prisma'
import { formatError } from '../utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import data from '../data'

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      phone: userSignUp.phone,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    // Always use database

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: user.phone }
    })

    if (existingUser) {
      return { success: false, error: 'يوجد حساب بهذا الرقم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' }
    }

    await prisma.user.create({
      data: {
        name: user.name,
        phone: user.phone,
        password: await bcrypt.hash(user.password, 5),
        role: 'User',
      }
    })
    return { success: true, message: 'تم إنشاء المستخدم بنجاح' }
  } catch (error) {
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return { success: false, error: 'يرجى التحقق من المدخلات والتأكد من ملء جميع الحقول بشكل صحيح.' }
      }
      if (error.message.includes('unique constraint')) {
        return { success: false, error: 'يوجد حساب بهذا الرقم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' }
      }
      if (error.message.includes('database')) {
        return { success: false, error: 'خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى لاحقاً.' }
      }
    }
    
    return { success: false, error: formatError(error) }
  }
}

// DELETE

export async function deleteUser(id: string) {
  try {
    const res = await prisma.user.delete({
      where: { id }
    })
    if (!res) throw new Error('User not found')
    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'تم حذف المستخدم بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// UPDATE

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user._id },
      data: {
        name: user.name,
        phone: user.phone,
        role: user.role,
      }
    })
    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'تم تغير الأسم',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE USER NAME
export async function updateUserName(user: IUserName) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'يجب تسجيل الدخول أولاً' }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session?.user?.id },
      data: {
        name: user.name,
      }
    })
    return {
      success: true,
      message: 'تم تغير الأسم',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE USER PHONE
export async function updateUserPhone(user: { phone: string }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'يجب تسجيل الدخول أولاً' }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session?.user?.id },
      data: {
        phone: user.phone,
      }
    })
    return {
      success: true,
      message: 'تم تحديث رقم الهاتف بنجاح',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE USER PASSWORD
export async function updateUserPassword(user: { 
  currentPassword: string
  newPassword: string 
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'يجب تسجيل الدخول أولاً' }
    }

    // First verify the current password
    const currentUser = await prisma.user.findUnique({
      where: { id: session?.user?.id }
    })
    
    if (!currentUser) {
      return { success: false, message: 'المستخدم غير موجود' }
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(user.currentPassword, currentUser.password)
    if (!isCurrentPasswordValid) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة' }
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(user.newPassword, 5)
    
    // Update the password
    const updatedUser = await prisma.user.update({
      where: { id: session?.user?.id },
      data: {
        password: hashedNewPassword,
      }
    })
    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function signInWithCredentials(user: IUserSignIn) {
  try {
    console.log('🔐 Attempting sign in with phone:', user.phone)
    
    const result = await signIn('credentials', { 
      phone: user.phone,
      password: user.password,
      redirect: false 
    })
    
    console.log('📋 Sign in result:', result)
    console.log('📋 Result type:', typeof result)
    console.log('📋 Result constructor:', result?.constructor?.name)
    console.log('📋 Result length:', result?.length)
    console.log('📋 Result keys:', result ? Object.keys(result) : 'null/undefined')
    console.log('📋 Result toString:', result?.toString())
    console.log('📋 Result valueOf:', result?.valueOf())
    
    if (result?.error) {
      console.log('❌ Sign in failed with error:', result.error)
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة'
      
      if (result.error.includes('CredentialsSignin')) {
        errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة'
      } else if (result.error.includes('Callback')) {
        errorMessage = 'خطأ في المصادقة. يرجى المحاولة مرة أخرى'
      } else if (result.error.includes('OAuth')) {
        errorMessage = 'خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى'
      } else if (result.error.includes('Configuration')) {
        errorMessage = 'خطأ في إعداد النظام. يرجى المحاولة مرة أخرى'
      } else if (result.error.includes('AccessDenied')) {
        errorMessage = 'تم رفض الوصول. يرجى التحقق من بياناتك'
      }
      
      return { 
        success: false, 
        message: errorMessage,
        error: result.error 
      }
    }
    
    if (result?.ok) {
      console.log('✅ Sign in successful, waiting for session...')
      
      // Wait a bit for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if we can get the session to confirm authentication
      try {
        const session = await auth()
        if (session?.user) {
          console.log('✅ Session confirmed for user:', session.user.name)
          return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح' 
          }
        } else {
          console.log('⚠️ Sign in succeeded but no session found')
          // Even if no session, if signIn returned ok, we should consider it successful
          // The session might take a moment to propagate
          return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح' 
          }
        }
      } catch (sessionError) {
        console.log('⚠️ Could not verify session, but sign in returned ok')
        // If we can't verify the session but signIn succeeded, assume it worked
        return { 
          success: true, 
          message: 'تم تسجيل الدخول بنجاح' 
        }
      }
    }
    
    // Handle case where signIn returns a URL (redirect case)
    if (typeof result === 'string' && result.includes('http')) {
      console.log('⚠️ Sign in returned URL, checking if authentication succeeded...')
      
      // If we get a URL, it might mean the sign-in succeeded but NextAuth is trying to redirect
      // Let's wait a bit longer for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if we can get a session to confirm authentication
      try {
        const session = await auth()
        if (session?.user) {
          console.log('✅ Session found after URL redirect, sign in successful')
          return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح' 
          }
        } else {
          console.log('⚠️ No session found after URL redirect, but this might be normal')
          // In some cases, NextAuth returns a URL even when authentication succeeds
          // Let's give it a bit more time and check again
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          try {
            const session2 = await auth()
            if (session2?.user) {
              console.log('✅ Session found on second attempt after URL redirect')
              return { 
                success: true, 
                message: 'تم تسجيل الدخول بنجاح' 
              }
            }
          } catch (sessionError2) {
            console.log('⚠️ Could not verify session on second attempt')
          }
          
          // If we still can't get a session, assume it failed
          return { 
            success: false, 
            message: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' 
          }
        }
      } catch (sessionError) {
        console.log('⚠️ Could not verify session after URL redirect')
        return { 
          success: false, 
          message: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' 
        }
      }
    }
    
    // Handle case where signIn returns an empty object or unexpected result
    if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
      console.log('⚠️ Sign in returned empty result, checking if authentication succeeded...')
      
      // Wait a bit for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if we can get a session to confirm authentication
      try {
        const session = await auth()
        if (session?.user) {
          console.log('✅ Session found after empty result, sign in successful')
          return { 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح' 
          }
        } else {
          console.log('⚠️ No session found after empty result')
          return { 
            success: false, 
            message: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' 
          }
        }
      } catch (sessionError) {
        console.log('⚠️ Could not verify session after empty result')
        return { 
          success: false, 
          message: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' 
        }
      }
    }
    
    console.log('⚠️ Sign in returned unexpected result:', result)
    return { 
      success: false, 
      message: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' 
    }
  } catch (error) {
    console.log('💥 Sign in error caught:', error)
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'حدث خطأ غير متوقع أثناء تسجيل الدخول'
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى'
      } else if (error.message.includes('credentials')) {
        errorMessage = 'بيانات غير صحيحة. يرجى التحقق من رقم الهاتف وكلمة المرور'
      } else if (error.message.includes('network')) {
        errorMessage = 'خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت'
      } else {
        errorMessage = error.message || 'فشل في المصادقة. يرجى المحاولة مرة أخرى'
      }
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error: formatError(error)
    }
  }
}
export const SignInWithGoogle = async () => {
  await signIn('google')
}
export const SignOut = async () => {
  try {
    const result = await signOut({ redirect: false })
    return { success: true, result }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: formatError(error) }
  }
}

// GET
export async function getAllUsers({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = data.settings[0];
  limit = limit || pageSize

  const skipAmount = (Number(page) - 1) * limit
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    skip: skipAmount,
    take: limit
  })
  const usersCount = await prisma.user.count()
  return {
    data: JSON.parse(JSON.stringify(users)),
    totalPages: Math.ceil(usersCount / limit),
  }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  if (!user) throw new Error('User not found')
  return JSON.parse(JSON.stringify(user))
}
