import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProductList from './product-list'

export const metadata: Metadata = {
  title: 'Admin Products',
}

export default async function AdminProduct() {
  const session = await auth()
  if (session?.user.role !== 'Admin') {
    redirect('/')
  }

  // Direct database query for products
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      countInStock: true,
      avgRating: true,
      isPublished: true,
      images: true,
      slug: true,
      updatedAt: true,
    }
  })

  // Convert Decimal values to numbers for client components
  const normalizedProducts = products.map(product => ({
    ...product,
    price: Number(product.price),
    avgRating: Number(product.avgRating),
  }))

  // Get total count for pagination
  const totalProducts = await prisma.product.count()

  return (
    <ProductList 
      initialProducts={normalizedProducts} 
      totalProducts={totalProducts}
    />
  )
}
