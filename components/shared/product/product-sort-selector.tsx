'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFilterUrl } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function ProductSortSelector({
  sortOrders,
  sort,
  params,
}: {
  sortOrders: { value: string; name: string }[]
  sort: string
  params: {
    q?: string
    category?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
    tag?: string | string[]
  }
}) {
  const router = useRouter()
  
  // Arabic translations
  const translations = {
    sortBy: 'ترتيب حسب'
  }
  
  return (
    <Select
      onValueChange={(v) => {
        router.push(getFilterUrl({ params, sort: v }))
      }}
      value={sort}
    >
      <SelectTrigger className="text-right" dir="rtl">
        <SelectValue>
          {translations.sortBy}: {sortOrders.find((s) => s.value === sort)!.name}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="text-right" dir="rtl">
        {sortOrders.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
