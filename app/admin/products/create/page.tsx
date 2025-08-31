import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إنشاء منتج',
}

const CreateProductPage = () => {
  return (
    <main className='max-w-6xl mx-auto p-4 rtl' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <div className='flex mb-4 text-right'>
        <Link href='/admin/products' className='text-orange-600 hover:text-orange-800'>المنتجات</Link>
        <span className='mx-1'>›</span>
        <Link href='/admin/products/create' className='text-gray-600'>إنشاء</Link>
      </div>

      <div className='my-8'>
        <ProductForm type='Create' />
      </div>
    </main>
  )
}

export default CreateProductPage
