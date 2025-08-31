import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AdminNav from './admin-nav'
import Footer from '@/components/shared/footer'
import data from '@/lib/data'
import DesktopNav from './desktop-nav'

const navigation = [
  { name: 'نظرة عامة', href: '/admin/overview' },
  { name: 'المنتجات', href: '/admin/products' },
  { name: 'الطلبات', href: '/admin/orders' },
  { name: 'المستخدمون', href: '/admin/users' },
  { name: 'صفحات الويب', href: '/admin/web-pages' },
  { name: 'الإعدادات', href: '/admin/settings' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user.role !== 'Admin') redirect('/')
  
  const { site } = data.settings[0];
  
  return (
    <>
      <div className='flex flex-col min-h-screen rtl admin-container' style={{ fontFamily: 'Cairo, sans-serif' }}>
        <div className='bg-black text-white relative'>
          <div className='flex items-center justify-between h-16 px-4 py-2'>
            {/* Menu button on the left - visible only on mobile */}
            <div className='md:hidden'>
              <AdminNav />
            </div>
            
            {/* Desktop Navigation Links - hidden on mobile */}
            <DesktopNav navigation={navigation} />
            
            {/* Logo on the right */}
            <Link href='/' className='flex items-center'>
              <Image
                src='/icons/logo.png'
                width={48}
                height={48}
                alt={`${site.name} logo`}
                className='h-10 w-auto sm:h-12 w-auto'
              />
            </Link>
          </div>
        </div>
        <main className='flex-1 p-3 sm:p-4 lg:p-6 rtl admin-container' style={{ fontFamily: 'Cairo, sans-serif' }}>{children}</main>
        <Footer />
      </div>
    </>
  )
}
