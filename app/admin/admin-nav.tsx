'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { SignOut } from '@/lib/actions/user.actions'

const navigation = [
  { name: 'نظرة عامة', href: '/admin/overview', icon: BarChart3 },
  { name: 'المنتجات', href: '/admin/products', icon: Package },
  { name: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
  { name: 'المستخدمون', href: '/admin/users', icon: Users },
  { name: 'صفحات الويب', href: '/admin/web-pages', icon: FileText },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Close sidebar when pathname changes (navigation)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSidebarOpen])

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
    <>
      {/* Menu Button */}
      <Button
        ref={menuButtonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="text-white hover:bg-gray-800"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Full Screen Modal */}
          <div 
            ref={sidebarRef}
            className="fixed inset-0 bg-black z-50 w-full h-full"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">لوحة الإدارة</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="text-white hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col p-4 space-y-2 flex-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200',
                      isActive
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-sm'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Sign Out Button at Bottom */}
            <div className="p-4 border-t border-gray-700">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:bg-red-900 hover:text-red-200 transition-colors"
              >
                <LogOut className="h-5 w-5 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
