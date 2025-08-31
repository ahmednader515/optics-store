import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { calculatePastDate } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import OverviewReport from './overview-report'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

const DashboardPage = async () => {
  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  // Prefetch default (last 30 days) overview data on the server
  const initialDate: DateRange = {
    from: calculatePastDate(30),
    to: new Date(),
  }

  // Direct database queries for overview stats
  const [totalOrders, totalRevenue, totalProducts, totalUsers] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: initialDate.from,
          lte: initialDate.to,
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        isPaid: true,
        createdAt: {
          gte: initialDate.from,
          lte: initialDate.to,
        },
      },
      _sum: {
        totalPrice: true,
      },
    }),
    prisma.product.count(),
    prisma.user.count(),
  ])

  const initialHeader = {
    ordersCount: totalOrders,
    totalSales: Number(totalRevenue._sum.totalPrice || 0),
    productsCount: totalProducts,
    usersCount: totalUsers,
  }

  return <OverviewReport initialDate={initialDate} initialHeader={initialHeader} />
}

export default DashboardPage
