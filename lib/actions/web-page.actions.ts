'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { formatError } from '@/lib/utils'

import { WebPageInputSchema, WebPageUpdateSchema } from '../validator'
import { z } from 'zod'

// CREATE
export async function createWebPage(data: z.infer<typeof WebPageInputSchema>) {
  try {
    const webPage = WebPageInputSchema.parse(data)
    
    // Mock mode removed: always use database
    
    await prisma.webPage.create({
      data: webPage
    })
    revalidatePath('/admin/web-pages')
    return {
      success: true,
      message: 'تم إنشاء الصفحة بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateWebPage(data: z.infer<typeof WebPageUpdateSchema>) {
  try {
    const webPage = WebPageUpdateSchema.parse(data)
    
    // Mock mode removed: always use database
    
    const { _id, ...updateData } = webPage
    
    await prisma.webPage.update({
      where: { id: _id },
      data: updateData
    })
    revalidatePath('/admin/web-pages')
    return {
      success: true,
      message: 'تم تحديث الصفحة بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// DELETE
export async function deleteWebPage(id: string) {
  try {
    const res = await prisma.webPage.delete({
      where: { id }
    })
    if (!res) throw new Error('WebPage not found')
    revalidatePath('/admin/web-pages')
    return {
      success: true,
      message: 'تم الحذف بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL
export async function getAllWebPages() {
  const webPages = await prisma.webPage.findMany()
  return JSON.parse(JSON.stringify(webPages))
}
export async function getWebPageById(webPageId: string) {
  const webPage = await prisma.webPage.findUnique({
    where: { id: webPageId }
  })
  return JSON.parse(JSON.stringify(webPage))
}

// GET ONE PAGE BY SLUG
export async function getWebPageBySlug(slug: string) {
  try {
    const webPage = await prisma.webPage.findFirst({
      where: { slug, isPublished: true }
    })
    if (!webPage) return null
    return JSON.parse(JSON.stringify(webPage))
  } catch (error) {
    console.warn('Database error in getWebPageBySlug:', error)
    return null
  }
}
