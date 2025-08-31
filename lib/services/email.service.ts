import { Order } from '@prisma/client'

// Email service with proper error handling
export const sendPurchaseReceipt = async ({ order }: { order: Order & { user?: { phone: string; name: string }; orderItems?: any[]; shippingAddress?: any } }) => {
  try {
    if (!order.user?.phone) {
      console.warn('Order user phone not available, skipping SMS send')
      return
    }
    
    // For now, just log the phone instead of sending it
    console.log('Purchase Receipt SMS would be sent to:', order.user.phone)
    console.log('Order details:', {
      orderId: order.id,
      totalPrice: order.totalPrice,
      user: order.user.name
    })
    
    // TODO: Implement SMS service later
    // await resend.emails.send({
    //   from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    //   to: order.user.phone,
    //   subject: 'Order Confirmation',
    //   react: PurchaseReceiptEmail({ order }),
    // })
  } catch (error) {
    console.warn('Failed to send purchase receipt SMS:', error)
    // Don't throw error, just log it
  }
}

export const sendAskReviewOrderItems = async ({ order }: { order: Order & { user?: { phone: string; name: string }; orderItems?: any[]; shippingAddress?: any } }) => {
  try {
    if (!order.user?.phone) {
      console.warn('Order user phone not available, skipping email send')
      return
    }

    // For now, just log the phone instead of sending it
    console.log('Review Request SMS would be sent to:', order.user.phone)
    console.log('Order details:', {
      orderId: order.id,
      user: order.user.name
    })

    // TODO: Implement SMS service later
    // await resend.emails.send({
    //   from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    //   to: order.user.phone,
    //   subject: 'Review your order items',
    //   react: AskReviewOrderItemsEmail({ order }),
    //   scheduledAt: oneDayFromNow,
    // })
  } catch (error) {
    console.warn('Failed to send review request SMS:', error)
    // Don't throw error, just log it
  }
}
