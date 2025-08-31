import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getOrderById } from '@/lib/actions/order.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Truck } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Payment Successful',
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const queryParams = await searchParams
  
  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await auth()
  if (!session?.user || session.user.id !== order.userId) {
    redirect('/auth/sign-in')
  }

  // Check if order is already paid
  if (order.isPaid) {
    redirect(`/account/orders/${order.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. Your payment has been processed successfully.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span className="text-gray-600">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Amount:</span>
              <span className="font-semibold text-green-600">
                ${Number(order.totalPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment Method:</span>
              <span className="text-gray-600">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order Date:</span>
              <span className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.shippingAddress ? (
              <>
                <div className="font-medium">{order.shippingAddress.fullName}</div>
                <div className="text-gray-600">{order.shippingAddress.street}</div>
                <div className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </div>
                <div className="text-gray-600">{order.shippingAddress.country}</div>
                <div className="text-gray-600">{order.shippingAddress.phone}</div>
              </>
            ) : (
              <div className="text-gray-500">Shipping address not available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
<p className="text-orange-800 text-sm">
            <strong>What happens next?</strong> We'll process your order and send you a confirmation email. 
            You can track your order status in your account dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href={`/account/orders/${order.id}`}>
              View Order Details
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/account/orders">
              All Orders
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
