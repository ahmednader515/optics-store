'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import useCartSidebar from '@/hooks/use-cart-sidebar'
import CartSidebar from './cart-sidebar'
import { ThemeProvider } from './theme-provider'
import { ColorProvider } from './color-provider'
import { Toaster } from '../ui/toaster'
import AppInitializer from './app-initializer'
import data from '@/lib/data'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const visible = useCartSidebar()
  const setting = data.settings[0]

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <ThemeProvider>
        <ColorProvider>
          <AppInitializer setting={setting}>
            {visible ? (
              <div className='flex min-h-screen bg-gray-50'>
                <div className='flex-1 overflow-hidden bg-white'>{children}</div>
                <CartSidebar />
              </div>
            ) : (
              <div className='min-h-screen bg-white'>{children}</div>
            )}
            <Toaster />
          </AppInitializer>
        </ColorProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
