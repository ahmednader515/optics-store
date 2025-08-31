'use client'

import useCartStore from '@/hooks/use-cart-store'

export default function MobileCartCount() {
  const { cart: { items } } = useCartStore()
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)
  
  if (cartItemsCount === 0) return null
  
  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {cartItemsCount}
    </span>
  )
}
