'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchFiltersProps {
  categories: string[]
  tags: string[]
  maxPrice: number
}

export default function SearchFilters({ categories, tags, maxPrice }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(true)
  const [priceRange, setPriceRange] = useState([0, maxPrice])
  
  // Get current filter values
  const currentCategory = searchParams.get('category') || ''
  const currentTags = searchParams.getAll('tag')
  const currentMinPrice = searchParams.get('minPrice') || '0'
  const currentMaxPrice = searchParams.get('maxPrice') || maxPrice.toString()

  // Arabic translations
  const translations = {
    filters: 'البحث',
    category: 'الفئة',
    tags: 'العلامات',
    priceRange: 'نطاق السعر',
    clearAll: 'مسح الكل',
    apply: 'تطبيق',
    showFilters: 'إظهار البحث',
    hideFilters: 'إخفاء البحث',
    allCategories: 'جميع الفئات',
    allTags: 'جميع العلامات',
    price: 'السعر',
    egp: 'ج.م',
    from: 'من',
    to: 'إلى',
    noResults: 'لا توجد نتائج',
    results: 'نتيجة',
    resultsPlural: 'نتائج'
  }

  const updateFilters = (newParams: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.delete(key)
        value.forEach(v => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })
    
    params.set('page', '1') // Reset to first page when filters change
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    if (currentCategory) params.set('category', currentCategory)
    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    if (category === currentCategory) {
      updateFilters({ category: '' })
    } else {
      updateFilters({ category })
    }
  }

  const handleTagChange = (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    updateFilters({ tag: newTags })
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
  }

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString()
    })
  }

  const removeFilter = (key: string, value?: string) => {
    if (key === 'category') {
      updateFilters({ category: '' })
    } else if (key === 'tag') {
      const newTags = currentTags.filter(t => t !== value)
      updateFilters({ tag: newTags })
    } else if (key === 'price') {
      updateFilters({ minPrice: '', maxPrice: '' })
      setPriceRange([0, maxPrice])
    }
  }

  const activeFilters = [
    ...(currentCategory ? [{ key: 'category', value: currentCategory, label: currentCategory }] : []),
    ...currentTags.map(tag => ({ key: 'tag', value: tag, label: tag })),
    ...(currentMinPrice !== '0' || currentMaxPrice !== maxPrice.toString() ? [{ key: 'price', value: '', label: `${currentMinPrice} - ${currentMaxPrice} ${translations.egp}` }] : [])
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6 lg:sticky lg:top-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
                     <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="font-semibold text-lg sm:text-xl text-gray-800">{translations.filters}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 sm:p-2 rounded-lg lg:hidden"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Always show filters on desktop, toggle on mobile */}
      <div className={isOpen ? 'block' : 'hidden lg:block'}>
        <>
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm font-medium text-gray-700">{translations.filters}:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {translations.clearAll}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                  >
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filter.key, filter.value)}
                      className="h-3 w-3 sm:h-4 sm:w-4 p-0"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-4 sm:mb-6">
            <Label className="text-sm font-semibold mb-3 sm:mb-4 block text-gray-800">{translations.category}</Label>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="all-categories"
                  checked={!currentCategory}
                  onCheckedChange={() => handleCategoryChange('')}
                  className="text-primary"
                />
                <Label htmlFor="all-categories" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                  {translations.allCategories}
                </Label>
              </div>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category}
                    checked={currentCategory === category}
                    onCheckedChange={() => handleCategoryChange(category)}
                    className="text-primary"
                  />
                  <Label htmlFor={category} className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Tags Filter */}
          <div className="mb-4 sm:mb-6">
            <Label className="text-sm font-semibold mb-3 sm:mb-4 block text-gray-800">{translations.tags}</Label>
            <div className="space-y-2 sm:space-y-3">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={tag}
                    checked={currentTags.includes(tag)}
                    onCheckedChange={() => handleTagChange(tag)}
                    className="text-primary"
                  />
                  <Label htmlFor={tag} className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-3 sm:my-4" />

          {/* Price Range Filter */}
          <div className="mb-4 sm:mb-6">
            <Label className="text-sm font-semibold mb-3 sm:mb-4 block text-gray-800">{translations.priceRange}</Label>
            <div className="space-y-3 sm:space-y-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={maxPrice}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full sm:w-auto">
                  <Label className="text-xs text-gray-600 mb-2 block">{translations.from}</Label>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="text-xs sm:text-sm border-gray-200 focus:border-primary focus:ring-primary input-mobile"
                    min={0}
                    max={priceRange[1]}
                  />
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <Label className="text-xs text-gray-600 mb-2 block">{translations.to}</Label>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                    className="text-xs sm:text-sm border-gray-200 focus:border-primary focus:ring-primary input-mobile"
                    min={priceRange[0]}
                    max={maxPrice}
                  />
                </div>
              </div>
              <Button
                onClick={applyPriceFilter}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-mobile"
                size="sm"
              >
                {translations.apply}
              </Button>
            </div>
          </div>
        </>
      </div>
    </div>
  )
}
