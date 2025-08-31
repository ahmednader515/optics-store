'use client'
import React from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { SignOut } from '@/lib/actions/user.actions'

interface NavigationItem {
  name: string
  href: string
}

interface DesktopNavProps {
  navigation: NavigationItem[]
}

export default function DesktopNav({ navigation }: DesktopNavProps) {
  const handleSignOut = async () => {
    try {
      await SignOut()
      window.location.reload()
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.reload()
    }
  }

  return (
    <nav className='hidden md:flex items-center space-x-6 space-x-reverse'>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className='text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800'
        >
          {item.name}
        </Link>
      ))}
      {/* Desktop Sign Out Button */}
      <button
        onClick={handleSignOut}
        className='text-red-400 hover:text-red-200 hover:bg-red-900 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2'
      >
        <LogOut className="h-4 w-4" />
        تسجيل الخروج
      </button>
    </nav>
  )
}
