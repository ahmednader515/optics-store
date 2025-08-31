/* eslint-disable no-unused-vars */

import data from '@/lib/data'
import { SiteCurrency } from '@/types'
import { create } from 'zustand'

interface SettingState {
  setting: any
  setSetting: (newSetting: any) => void
  getCurrency: () => SiteCurrency
  setCurrency: (currency: string) => void
}

const useSettingStore = create<SettingState>((set, get) => ({
  setting: {
    ...data.settings[0],
    currency: data.settings[0].defaultCurrency,
  },
  setSetting: (newSetting: any) => {
    set({
      setting: {
        ...newSetting,
        currency: newSetting.currency || get().setting.currency,
      },
    })
  },
  getCurrency: () => {
    return (
      get().setting.availableCurrencies.find(
        (c: any) => c.code === get().setting.currency
      ) || data.settings[0].availableCurrencies[0]
    )
  },
  setCurrency: async (currency: string) => {
    set({ setting: { ...get().setting, currency } })
  },
}))

export default useSettingStore
