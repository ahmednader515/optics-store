import { prisma } from '@/lib/prisma'

// Re-export unified prisma client
export { prisma }

// Utility function to fetch products for multiple categories efficiently
export async function getProductsForMultipleCategories(categories: string[]) {
  try {
    // Use a single query to get all products for all categories
    const allProducts = await prisma.product.findMany({
      where: {
        category: { in: categories },
        isPublished: true,
      },
      orderBy: [
        { numSales: 'desc' },
        { avgRating: 'desc' }
      ],
      select: {
        name: true,
        slug: true,
        images: true,
        price: true,
        listPrice: true,
        avgRating: true,
        numReviews: true,
        category: true,
      }
    })

    // Group products by category
    const productsByCategory = categories.reduce((acc, category) => {
      acc[category] = allProducts
        .filter(product => product.category === category)
        .slice(0, 8) // Limit to 8 products per category
        .map(product => ({
          name: product.name,
          slug: product.slug,
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
          images: Array.isArray(product.images) ? product.images : [],
          price: Number(product.price),
          listPrice: Number(product.listPrice),
          avgRating: Number(product.avgRating),
          numReviews: Number(product.numReviews),
        }))
      return acc
    }, {} as Record<string, any[]>)

    return productsByCategory
  } catch (error) {
    console.error('Error fetching products for multiple categories:', error)
    // Return empty object with all categories
    return categories.reduce((acc, category) => {
      acc[category] = []
      return acc
    }, {} as Record<string, any[]>)
  }
}
