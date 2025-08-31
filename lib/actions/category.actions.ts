'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Category input schema
const CategoryInputSchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب'),
  description: z.string().optional(),
  slug: z.string().min(1, 'رابط الفئة مطلوب'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

// Category update schema
const CategoryUpdateSchema = CategoryInputSchema.extend({
  id: z.string().min(1, 'معرف الفئة مطلوب'),
})

export type ICategoryInput = z.infer<typeof CategoryInputSchema>
export type ICategoryUpdate = z.infer<typeof CategoryUpdateSchema>

// CREATE CATEGORY
export async function createCategory(data: ICategoryInput) {
  try {
    const validatedData = CategoryInputSchema.parse(data)
    
    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { 
        OR: [
          { name: validatedData.name },
          { slug: validatedData.slug }
        ]
      }
    })
    
    if (existingCategory) {
      return { 
        success: false, 
        message: 'الفئة موجودة بالفعل' 
      }
    }
    
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        slug: validatedData.slug,
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder,
      }
    })
    
    revalidatePath('/admin/settings')
    revalidatePath('/')
    
    return {
      success: true,
      message: 'تم إنشاء الفئة بنجاح',
      data: category
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'فشل في إنشاء الفئة' 
    }
  }
}

// UPDATE CATEGORY
export async function updateCategory(data: ICategoryUpdate) {
  try {
    const validatedData = CategoryUpdateSchema.parse(data)
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: validatedData.id }
    })
    
    if (!existingCategory) {
      return { 
        success: false, 
        message: 'الفئة غير موجودة' 
      }
    }
    
    // Check if name or slug conflicts with other categories
    const conflictingCategory = await prisma.category.findFirst({
      where: { 
        AND: [
          { id: { not: validatedData.id } },
          {
            OR: [
              { name: validatedData.name },
              { slug: validatedData.slug }
            ]
          }
        ]
      }
    })
    
    if (conflictingCategory) {
      return { 
        success: false, 
        message: 'اسم الفئة أو الرابط مستخدم بالفعل' 
      }
    }
    
    const category = await prisma.category.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        slug: validatedData.slug,
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder,
      }
    })
    
    revalidatePath('/admin/settings')
    revalidatePath('/')
    
    return {
      success: true,
      message: 'تم تحديث الفئة بنجاح',
      data: category
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'فشل في تحديث الفئة' 
    }
  }
}

// DELETE CATEGORY
export async function deleteCategory(id: string) {
  try {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })
    
    if (!existingCategory) {
      return { 
        success: false, 
        message: 'الفئة غير موجودة' 
      }
    }
    
    // Check if category is used by any products
    const productsUsingCategory = await prisma.product.findFirst({
      where: { category: existingCategory.name }
    })
    
    if (productsUsingCategory) {
      return { 
        success: false, 
        message: 'لا يمكن حذف الفئة لأنها مستخدمة في منتجات' 
      }
    }
    
    await prisma.category.delete({
      where: { id }
    })
    
    revalidatePath('/admin/settings')
    revalidatePath('/')
    
    return {
      success: true,
      message: 'تم حذف الفئة بنجاح'
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'فشل في حذف الفئة' 
    }
  }
}

// GET ALL CATEGORIES
export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    
    return categories
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

// GET ACTIVE CATEGORIES
export async function getActiveCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
    
    return categories
  } catch (error) {
    console.error('Error getting active categories:', error)
    return []
  }
}

// GET CATEGORY BY ID
export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id }
    })
    
    return category
  } catch (error) {
    console.error('Error getting category:', error)
    return null
  }
}

// REORDER CATEGORIES
export async function reorderCategories(categoryIds: string[]) {
  try {
    const updates = categoryIds.map((id, index) => 
      prisma.category.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
    
    await prisma.$transaction(updates)
    
    revalidatePath('/admin/settings')
    revalidatePath('/')
    
    return {
      success: true,
      message: 'تم إعادة ترتيب الفئات بنجاح'
    }
  } catch (error) {
    console.error('Error reordering categories:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'فشل في إعادة ترتيب الفئات' 
    }
  }
}
