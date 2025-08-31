'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import useColorStore from '@/hooks/use-color-store'
export function ColorProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { color, updateCssVariables } = useColorStore('light')
  React.useEffect(() => {
    updateCssVariables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
