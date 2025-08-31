import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import qs from 'query-string'

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string
  key: string
  value: string | null
}) {
  const currentUrl = qs.parse(params)

  currentUrl[key] = value

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : int
}
// PROMPT: [ChatGTP] create toSlug ts arrow function that convert text to lowercase, remove non-word,
// non-whitespace, non-hyphen characters, replace whitespace, trim leading hyphens and trim trailing hyphens

export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-EG', {
  currency: 'EGP',
  style: 'currency',
  minimumFractionDigits: 2,
})
export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-EG')
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}

export const round2 = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100

export const generateId = () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join('')

export const formatError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'name' in error) {
    if (error.name === 'ZodError' && 'errors' in error && Array.isArray(error.errors)) {
      const fieldErrors = error.errors.map((err: unknown) => {
        if (err && typeof err === 'object' && 'path' in err && 'message' in err) {
          return `${err.path}: ${err.message}`
        }
        return 'Validation error'
      })
      return fieldErrors.join('. ')
    } else if (error.name === 'ValidationError' && 'errors' in error && typeof error.errors === 'object' && error.errors !== null) {
      const fieldErrors = Object.keys(error.errors).map((field) => {
        const err = (error.errors as Record<string, unknown>)[field]
        if (err && typeof err === 'object' && 'message' in err) {
          return err.message
        }
        return 'Validation error'
      })
      return fieldErrors.join('. ')
    } else if ('code' in error && error.code === 11000 && 'keyValue' in error && typeof error.keyValue === 'object' && error.keyValue !== null) {
      const duplicateField = Object.keys(error.keyValue)[0]
      return `${duplicateField} already exists`
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message)
  }
  
  return 'Something went wrong. Please try again.'
}

export function calculateFutureDate(days: number) {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + days)
  return currentDate
}
export function getMonthName(yearMonth: string): string {
  // Add safety checks
  if (!yearMonth || typeof yearMonth !== 'string') {
    console.warn('getMonthName: Invalid input:', yearMonth)
    return 'Unknown Month'
  }
  
  const parts = yearMonth.split('-')
  if (parts.length !== 2) {
    console.warn('getMonthName: Invalid format:', yearMonth)
    return 'Unknown Month'
  }
  
  const [year, month] = parts.map(Number)
  
  // Check if the parsed values are valid numbers
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    console.warn('getMonthName: Invalid year or month:', { year, month })
    return 'Unknown Month'
  }
  
  const date = new Date(year, month - 1)
  const monthName = date.toLocaleString('default', { month: 'long' })
  const now = new Date()

  if (year === now.getFullYear() && month === now.getMonth() + 1) {
    return `${monthName} Ongoing`
  }
  return monthName
}
export function calculatePastDate(days: number) {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - days)
  return currentDate
}
export function timeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0) // Set to 12:00 AM (next day)

  const diff = midnight.getTime() - now.getTime() // Difference in milliseconds
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { hours, minutes }
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }
  const dateOptions: Intl.DateTimeFormatOptions = {
    // weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  )
  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  )
  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  )
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  }
}

export function formatId(id: string | undefined | null) {
  if (!id) return 'N/A'
  return `..${id.substring(id.length - 6)}`
}

export const getFilterUrl = ({
  params,
  category,
  tag,
  sort,
  price,
  rating,
  page,
}: {
  params: {
    q?: string
    category?: string
    tag?: string | string[]
    price?: string
    rating?: string
    sort?: string
    page?: string
  }
  tag?: string | string[]
  category?: string
  sort?: string
  price?: string
  rating?: string
  page?: string
}) => {
  const newParams = { ...params }
  if (category !== undefined) newParams.category = category
  if (tag !== undefined) newParams.tag = tag
  if (price) newParams.price = price
  if (rating) newParams.rating = rating
  if (page) newParams.page = page
  if (sort) newParams.sort = sort
  
  // Handle array parameters properly
  const searchParams = new URLSearchParams()
  Object.entries(newParams).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v))
      } else {
        searchParams.set(key, value)
      }
    }
  })
  
  return `/search?${searchParams.toString()}`
}

/**
 * Safely formats a price value to 2 decimal places
 * Handles cases where price might be a Decimal, string, or undefined
 */
export const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return '0.00'
  const numPrice = Number(price)
  if (isNaN(numPrice)) return '0.00'
  return numPrice.toFixed(2)
}
