'use client'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import { useEffect } from 'react'

export default function AddToBrowsingHistory({
  id,
  category,
  name,
  image,
  slug,
}: {
  id: string
  category: string
  name: string
  image: string
  slug: string
}) {
  const { addItem } = useBrowsingHistory()
  useEffect(() => {
    addItem({ id, category, name, image, slug })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
