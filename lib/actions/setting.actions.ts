'use server'

import { prisma } from '@/lib/prisma'
import data from '@/lib/data'
import { ISettingInput } from '@/types'
import { formatError } from '@/lib/utils'
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'

export async function getSetting(): Promise<ISettingInput> {
  try {
    const cached = await unstable_cache(
      async () => {
        const s = await prisma.setting.findFirst()
        if (!s) return null
        return JSON.parse(JSON.stringify(s)) as ISettingInput
      },
      ['settings'],
      { revalidate: 300, tags: ['settings'] }
    )()
    const existing = cached
    if (!existing) {
      // Seed with default settings from data.ts if none exist
      const created = await prisma.setting.create({
        data: {
          common: data.settings[0].common as any,
          site: data.settings[0].site as any,
          carousels: data.settings[0].carousels as any,
          availableLanguages: data.settings[0].availableLanguages as any,
          defaultLanguage: data.settings[0].defaultLanguage,
          availableCurrencies: data.settings[0].availableCurrencies as any,
          defaultCurrency: data.settings[0].defaultCurrency,
          availablePaymentMethods: data.settings[0].availablePaymentMethods as any,
          defaultPaymentMethod: data.settings[0].defaultPaymentMethod,
          availableDeliveryDates: data.settings[0].availableDeliveryDates as any,
          defaultDeliveryDate: data.settings[0].defaultDeliveryDate,
        },
      })
      // Invalidate settings cache after seed
      revalidateTag('settings')
      return JSON.parse(JSON.stringify(created)) as ISettingInput
    }
    return existing as ISettingInput
  } catch (err) {
    console.error('Error in getSetting:', err)
    // Fallback to static data to avoid breaking the app
    return data.settings[0] as ISettingInput
  }
}

export async function updateSetting(newSetting: ISettingInput) {
  try {
    const existing = await prisma.setting.findFirst({ select: { id: true } })

    if (!existing) {
      await prisma.setting.create({
        data: {
          common: newSetting.common as any,
          site: newSetting.site as any,
          carousels: newSetting.carousels as any,
          availableLanguages: newSetting.availableLanguages as any,
          defaultLanguage: newSetting.defaultLanguage,
          availableCurrencies: newSetting.availableCurrencies as any,
          defaultCurrency: newSetting.defaultCurrency,
          availablePaymentMethods: newSetting.availablePaymentMethods as any,
          defaultPaymentMethod: newSetting.defaultPaymentMethod,
          availableDeliveryDates: newSetting.availableDeliveryDates as any,
          defaultDeliveryDate: newSetting.defaultDeliveryDate,
        },
      })
    } else {
      await prisma.setting.update({
        where: { id: existing.id },
        data: {
          common: newSetting.common as any,
          site: newSetting.site as any,
          carousels: newSetting.carousels as any,
          availableLanguages: newSetting.availableLanguages as any,
          defaultLanguage: newSetting.defaultLanguage,
          availableCurrencies: newSetting.availableCurrencies as any,
          defaultCurrency: newSetting.defaultCurrency,
          availablePaymentMethods: newSetting.availablePaymentMethods as any,
          defaultPaymentMethod: newSetting.defaultPaymentMethod,
          availableDeliveryDates: newSetting.availableDeliveryDates as any,
          defaultDeliveryDate: newSetting.defaultDeliveryDate,
        },
      })
    }

    revalidatePath('/admin/settings')
    revalidatePath('/')
    revalidateTag('settings')

    return { success: true, message: 'تم حفظ الإعدادات بنجاح' }
  } catch (error) {
    console.error('Error in updateSetting:', error)
    return { success: false, message: formatError(error) }
  }
}
