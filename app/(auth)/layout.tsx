import Link from 'next/link'
import Image from 'next/image'
import SeparatorWithOr from '@/components/shared/separator-or'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import data from '@/lib/data'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = data.settings[0];
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='mx-auto w-full min-w-80 p-4 flex-1 flex flex-col items-center justify-center'>{children}</main>
      <Footer />
    </div>
  )
}
