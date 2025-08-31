'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { formatError } from '../utils'
import { ReviewInputSchema } from '../validator'
//

export async function createUpdateReview({
  data,
  path,
}: {
  data: z.infer<typeof ReviewInputSchema>
  path: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('User is not authenticated')
    }

    const review = ReviewInputSchema.parse({
      ...data,
      user: session.user.id,
    })

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: review.product,
        userId: review.user,
      }
    })

    if (existingReview) {
      // Update existing review
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          comment: review.comment,
          rating: review.rating,
          title: review.title,
          updatedAt: new Date(),
        }
      })
    } else {
      // Create new review
      await prisma.review.create({
        data: {
          userId: review.user,
          productId: review.product,
          isVerifiedPurchase: review.isVerifiedPurchase,
          rating: review.rating,
          title: review.title || '',
          comment: review.comment,
        }
      })
    }

    // Update product review statistics
    await updateProductReviewStats(review.product)

    // Revalidate the correct product page by slug
    try {
      const product = await prisma.product.findUnique({
        where: { id: review.product },
        select: { slug: true },
      })
      if (product?.slug) {
        revalidatePath(`/product/${product.slug}`)
      }
    } catch (e) {
      // noop
    }
    return {
      success: true,
      message: existingReview ? 'تم تحديث التقييم بنجاح' : 'تم إنشاء التقييم بنجاح',
    }
  } catch (error) {
    console.error('Review creation error:', error)
    return {
      success: false,
      message: formatError(error),
    }
  }
}

const updateProductReviewStats = async (productId: string) => {
  try {
    // Get all reviews for this product
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    })
    
    if (reviews.length === 0) {
      // No reviews, reset product stats
      await prisma.product.update({
        where: { id: productId },
        data: {
          avgRating: 0,
          numReviews: 0,
          ratingDistribution: [],
        }
      })
      return
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const avgRating = totalRating / reviews.length

    // Calculate rating distribution
    const ratingDistribution = []
    for (let i = 1; i <= 5; i++) {
      const count = reviews.filter(r => r.rating === i).length
      ratingDistribution.push({ rating: i, count })
    }
    
    // Update product with new stats
    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        numReviews: reviews.length,
        ratingDistribution,
      }
    })
  } catch (error) {
    console.error('Error updating product review stats:', error)
  }
}

export async function getReviews({
  productId,
  limit = 10,
  page = 1,
}: {
  productId: string
  limit?: number
  page?: number
}) {
  try {
    const skipAmount = (page - 1) * limit
    
    // Get reviews with user information
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { 
            name: true,
            id: true 
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skipAmount,
      take: limit,
    })

    // Get total count for pagination
    const totalReviews = await prisma.review.count({
      where: { productId }
    })

    const totalPages = Math.ceil(totalReviews / limit)

    // Transform reviews to match expected format
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      product: review.productId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt.toISOString(),
      user: {
        name: review.user.name,
        id: review.userId,
      }
    }))

    return {
      data: transformedReviews,
      totalPages: totalPages === 0 ? 1 : totalPages,
      totalReviews,
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return {
      data: [],
      totalPages: 1,
      totalReviews: 0,
    }
  }
}

export const getUserReviewForProduct = async (productId: string) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }
    
    const review = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.user.id,
      },
    })
    
    return review
  } catch (error) {
    console.error('Error fetching user review:', error)
    return null
  }
}

export const deleteReview = async (reviewId: string, path: string) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('User is not authenticated')
    }

    // Get the review to check ownership and get productId
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, productId: true }
    })

    if (!review) {
      throw new Error('Review not found')
    }

    if (review.userId !== session.user.id) {
      throw new Error('You can only delete your own reviews')
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Update product review stats
    await updateProductReviewStats(review.productId)

    // Revalidate the correct product page by slug
    try {
      const product = await prisma.product.findUnique({
        where: { id: review.productId },
        select: { slug: true },
      })
      if (product?.slug) {
        revalidatePath(`/product/${product.slug}`)
      }
    } catch (e) {
      // noop
    }
    return {
      success: true,
      message: 'تم حذف التقييم بنجاح',
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
