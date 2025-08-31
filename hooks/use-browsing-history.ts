import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BrowsingHistoryItem = {
  id: string
  category: string
  name: string
  image: string
  slug: string
  timestamp: number
}

type BrowsingHistory = {
  products: BrowsingHistoryItem[]
}

const initialState: BrowsingHistory = {
  products: [],
}

export const browsingHistoryStore = create<BrowsingHistory>()(
  persist(() => initialState, {
    name: 'browsingHistoryStore',
  })
)

export default function useBrowsingHistory() {
  const { products } = browsingHistoryStore()
  
  return {
    products,
    addItem: (product: Omit<BrowsingHistoryItem, 'timestamp'>) => {
      const newItem: BrowsingHistoryItem = {
        ...product,
        timestamp: Date.now()
      }
      
      const index = products.findIndex((p) => p.id === product.id)
      if (index !== -1) {
        // Remove existing item if it exists
        products.splice(index, 1)
      }
      
      // Add new item to the start
      products.unshift(newItem)

      // Keep only the last 20 items
      if (products.length > 20) {
        products.splice(20)
      }

      browsingHistoryStore.setState({
        products: [...products],
      })
    },

    clear: () => {
      browsingHistoryStore.setState({
        products: [],
      })
    },

    removeItem: (id: string) => {
      const filteredProducts = products.filter(p => p.id !== id)
      browsingHistoryStore.setState({
        products: filteredProducts,
      })
    },
  }
}
