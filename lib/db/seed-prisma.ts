import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { loadEnvFromFile } from '../env-loader'
import data from '../data'

// Load environment variables from .env file
loadEnvFromFile()

const prisma = new PrismaClient().$extends(withAccelerate())

async function main() {
  console.log('🌱 Starting Prisma seed...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.orderShippingAddress.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.userAddress.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.webPage.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create users
  const users = await Promise.all(
    data.users.map(async (userData) => {
      // Password is already hashed in data.ts, so use it directly
      return prisma.user.create({
        data: {
          phone: userData.phone,
          name: userData.name,
          role: userData.role,
          password: userData.password, // Already hashed in data.ts
          address: {
            create: {
              fullName: userData.address.fullName,
              street: userData.address.street,
              city: userData.address.city,
              province: userData.address.province,
              postalCode: userData.address.postalCode,
              country: userData.address.country,
              phone: userData.address.phone,
            }
          }
        },
        include: {
          address: true
        }
      })
    })
  )

  console.log(`👥 Created ${users.length} users`)

  // Create products
  const products = await Promise.all(
    data.products.map((productData) =>
      prisma.product.create({
        data: {
          name: productData.name,
          slug: productData.slug,
          category: productData.category,
          images: productData.images,
          brand: productData.brand,
          description: productData.description,
          price: productData.price,
          listPrice: productData.listPrice,
          countInStock: productData.countInStock,
          tags: productData.tags,
          colors: productData.colors,
          sizes: productData.sizes,
          avgRating: productData.avgRating,
          numReviews: productData.numReviews,
          ratingDistribution: productData.ratingDistribution as any,
          numSales: productData.numSales,
          isPublished: productData.isPublished,
        }
      })
    )
  )

  console.log(`📦 Created ${products.length} products`)

  // Create orders
  const orders = await Promise.all(
    data.orders.map(async (orderData) => {
      // Find a real user ID to associate with the order
      const user = users[Math.floor(Math.random() * users.length)]
      
      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          expectedDeliveryDate: orderData.expectedDeliveryDate,
          paymentMethod: orderData.paymentMethod,
          itemsPrice: orderData.itemsPrice,
          shippingPrice: orderData.shippingPrice,
          taxPrice: orderData.taxPrice,
          totalPrice: orderData.totalPrice,
          isPaid: orderData.isPaid,
          paidAt: orderData.paidAt,
          isDelivered: orderData.isDelivered,
          deliveredAt: orderData.deliveredAt,
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        orderData.orderItems.map(async (itemData) => {
          // Find a real product ID to associate with the order item
          const product = products.find(p => p.name === itemData.name)
          if (!product) return null
          
          return prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              clientId: user.id, // Use user ID as client ID
              name: itemData.name,
              slug: product.slug,
              category: itemData.category,
              quantity: itemData.quantity,
              countInStock: product.countInStock,
              image: itemData.image,
              price: itemData.price,
            }
          })
        })
      )

      // Create shipping address for the order
      if (orderData.shippingAddress) {
        await prisma.orderShippingAddress.create({
          data: {
            orderId: order.id,
            street: orderData.shippingAddress.street,
            province: orderData.shippingAddress.province,
            area: orderData.shippingAddress.area,
            apartment: orderData.shippingAddress.apartment,
            building: orderData.shippingAddress.building,
            floor: orderData.shippingAddress.floor,
            landmark: orderData.shippingAddress.landmark,
          }
        })
      }

      return order
    })
  )

  console.log(`🛒 Created ${orders.length} orders`)

  // Create settings
  const settings = await Promise.all(
    data.settings.map((settingData) =>
      prisma.setting.create({
        data: {
          common: settingData.common as any,
          site: settingData.site as any,
          carousels: settingData.carousels as any,
          availableLanguages: settingData.availableLanguages as any,
          defaultLanguage: settingData.defaultLanguage,
          availableCurrencies: settingData.availableCurrencies as any,
          defaultCurrency: settingData.defaultCurrency,
          availablePaymentMethods: settingData.availablePaymentMethods as any,
          defaultPaymentMethod: settingData.defaultPaymentMethod,
          availableDeliveryDates: settingData.availableDeliveryDates as any,
          defaultDeliveryDate: settingData.defaultDeliveryDate,
        }
      })
    )
  )

  console.log(`⚙️  Created ${settings.length} settings`)

  // Create web pages
  const webPages = await Promise.all(
    data.webPages.map((webPageData) =>
      prisma.webPage.create({
        data: {
          title: webPageData.title,
          slug: webPageData.slug,
          content: webPageData.content,
          isPublished: webPageData.isPublished,
        }
      })
    )
  )

  console.log(`📄 Created ${webPages.length} web pages`)

  console.log('✅ Prisma seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Prisma seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
