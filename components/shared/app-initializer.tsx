import React, { useEffect } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import { updateCssVariables } from '@/hooks/use-color-store'

export default function AppInitializer({
  children,
  setting,
}: {
  children: React.ReactNode
  setting: any
}) {
  useEffect(() => {
    // Initialize Orange theme
    updateCssVariables()
    
    // Initialize settings
    useSettingStore.setState({
      setting,
    })
  }, [setting])

  return children
}
