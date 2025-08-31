import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from '@/lib/actions/product.actions'
import data from '@/lib/data'
import Link from 'next/link'

export default async function DebugPage() {
  console.log('🔍 Debug page loaded')
  
  // Test all the data fetching functions
  const categories = await getAllCategories()
  const bestSellers = await getProductsByTag({ tag: 'best-seller' })
  const featured = await getProductsForCard({ tag: 'featured' })
  const sunglasses = await getProductsByTag({ tag: 'sunglasses' })
  
  // Get all available tags from data
  const allTags = new Set<string>()
  data.products.forEach(product => {
    if (product.tags) {
      product.tags.forEach(tag => allTags.add(tag))
    }
  })
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      <div className="space-y-8">
        {/* Environment Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
          <p><strong>DATABASE_URL exists:</strong> {process.env.DATABASE_URL ? 'Yes' : 'No'}</p>
          <p><strong>NEXTAUTH_SECRET exists:</strong> {process.env.NEXTAUTH_SECRET ? 'Yes' : 'No'}</p>
          <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || 'Not set'}</p>
          
          {/* Show DATABASE_URL format if it exists */}
          {process.env.DATABASE_URL && (
            <div className="mt-2 p-2 bg-yellow-100 rounded">
              <p><strong>DATABASE_URL format:</strong></p>
              <p className="text-sm font-mono break-all">
                {process.env.DATABASE_URL.startsWith('postgresql://') ? '✅ PostgreSQL format' : '❌ Not PostgreSQL format'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {process.env.DATABASE_URL.substring(0, 50)}...
              </p>
            </div>
          )}
        </div>
        
        {/* Available Tags */}
        <div className="bg-orange-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Available Tags</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(allTags).map(tag => (
              <span key={tag} className="bg-orange-200 px-2 py-1 rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Categories */}
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <p><strong>Count:</strong> {categories.length}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(category => (
              <span key={category} className="bg-green-200 px-2 py-1 rounded text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
        
        {/* Best Sellers */}
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Best Sellers (best-seller tag)</h2>
          <p><strong>Count:</strong> {bestSellers.length}</p>
          <div className="space-y-2 mt-2">
            {bestSellers.map((product: any, index: number) => (
              <div key={index} className="bg-yellow-200 p-2 rounded">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Tags:</strong> {product.tags?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Featured Products */}
        <div className="bg-purple-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Featured Products (featured tag)</h2>
          <p><strong>Count:</strong> {featured.length}</p>
          <div className="space-y-2 mt-2">
            {featured.map((product: any, index: number) => (
              <div key={index} className="bg-purple-200 p-2 rounded">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Tags:</strong> {product.tags?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sunglasses Products */}
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">النظارات الشمسية Products (sunglasses tag)</h2>
          <p><strong>Count:</strong> {sunglasses.length}</p>
          <div className="space-y-2 mt-2">
            {sunglasses.map((product: any, index: number) => (
              <div key={index} className="bg-red-200 p-2 rounded">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Tags:</strong> {product.tags?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Raw Data Sample */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Raw Data Sample</h2>
          <p><strong>Total Products:</strong> {data.products.length}</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-semibold">Show first 3 products</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(data.products.slice(0, 3), null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
