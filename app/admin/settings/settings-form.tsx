'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, Image as ImageIcon, Upload, Truck, Calculator, DollarSign } from 'lucide-react'
import data from '@/lib/data'
import { updateSetting } from '@/lib/actions/setting.actions'

interface CarouselItem {
  title: string
  buttonCaption: string
  image: string
  url: string
}

interface SeasonalDiscount {
  name: string
  startDate: string
  endDate: string
  discountRate: number
  applicableCategories: string[]
}

export default function SettingsForm({ setting }: { setting: any }) {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryTimeHours: 4,
    deliveryPrice: 4.99,
    freeShippingThreshold: 50,
  })
  const [taxSettings, setTaxSettings] = useState({
    taxRate: 7.5,
    taxIncluded: false,
    taxExemptCategories: ['prescription-medications', 'medical-devices'],
    taxExemptThreshold: 0,
  })
  const [productPricing, setProductPricing] = useState({
    defaultMarkup: 30,
    bulkDiscountThreshold: 5,
    bulkDiscountRate: 10,
    seasonalDiscounts: [
      {
        name: 'Winter Sale',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        discountRate: 15,
        applicableCategories: ['vitamins', 'supplements', 'cold-flu'],
      },
      {
        name: 'Summer Wellness',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        discountRate: 20,
        applicableCategories: ['sunscreen', 'hydration', 'vitamins'],
      },
    ] as SeasonalDiscount[],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const settings = setting || data.settings[0]
    if (settings) {
      setCarouselItems(settings.carousels || [])
      if (settings.deliverySettings) {
        const delivery = settings.deliverySettings
        if ('deliveryTimeHours' in delivery) {
          setDeliverySettings(delivery)
        } else {
          setDeliverySettings({
            deliveryTimeHours: 4,
            deliveryPrice: delivery.standardDeliveryPrice || 4.99,
            freeShippingThreshold: delivery.freeShippingThreshold || 50,
          })
        }
      }
      if (settings.taxSettings) {
        setTaxSettings(settings.taxSettings)
      }
      if (settings.productPricing) {
        setProductPricing(settings.productPricing)
      }
    }
  }, [setting])

  const handleCarouselChange = (index: number, field: keyof CarouselItem, value: string) => {
    const newCarouselItems = [...carouselItems]
    newCarouselItems[index] = { ...newCarouselItems[index], [field]: value }
    
    // Auto-update URL when title changes
    if (field === 'title') {
      newCarouselItems[index].url = `/search?category=${value}`
    }
    
    setCarouselItems(newCarouselItems)
  }

  const addCarouselItem = () => {
    setCarouselItems([
      ...carouselItems,
      {
        title: 'عنوان جديد',
        buttonCaption: 'زر جديد',
        image: '/images/banner1.jpg',
        url: '/search?category=عنوان جديد'
      }
    ])
  }

  const removeCarouselItem = (index: number) => {
    if (carouselItems.length > 1) {
      const newCarouselItems = carouselItems.filter((_, i) => i !== index)
      setCarouselItems(newCarouselItems)
    } else {
      toast({
        title: 'لا يمكن الحذف',
        description: 'يجب أن يحتوي الكاروسيل على عنصر واحد على الأقل',
        variant: 'destructive'
      })
    }
  }

  const handleImageUpload = async (index: number, file: File) => {
    try {
      // For now, we'll use a local file URL as a placeholder
      // In production, you would upload to your server or cloud storage
      const imageUrl = URL.createObjectURL(file)
      
      const newCarouselItems = [...carouselItems]
      newCarouselItems[index].image = imageUrl
      setCarouselItems(newCarouselItems)
      
      toast({
        title: 'تم تحديث الصورة',
        description: 'تم تحديث الصورة بنجاح (ملاحظة: هذا مؤقت، يرجى تحديث الرابط يدوياً)',
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'خطأ في تحديث الصورة',
        description: 'فشل في تحديث الصورة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      })
    }
  }

  const addSeasonalDiscount = () => {
    setProductPricing({
      ...productPricing,
      seasonalDiscounts: [
        ...productPricing.seasonalDiscounts,
        {
          name: 'خصم جديد',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          discountRate: 10,
          applicableCategories: [],
        }
      ]
    })
  }

  const removeSeasonalDiscount = (index: number) => {
    const newSeasonalDiscounts = productPricing.seasonalDiscounts.filter((_, i) => i !== index)
    setProductPricing({
      ...productPricing,
      seasonalDiscounts: newSeasonalDiscounts
    })
  }

  const updateSeasonalDiscount = (index: number, field: keyof SeasonalDiscount, value: any) => {
    const newSeasonalDiscounts = [...productPricing.seasonalDiscounts]
    newSeasonalDiscounts[index] = { ...newSeasonalDiscounts[index], [field]: value }
    setProductPricing({
      ...productPricing,
      seasonalDiscounts: newSeasonalDiscounts
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const newSetting = {
        ...data.settings[0],
        carousels: carouselItems,
        deliverySettings,
        taxSettings,
        productPricing,
      } as any

      const res = await updateSetting(newSetting)
      if (!res.success) {
        toast({
          title: 'خطأ في الحفظ',
          description: res.message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'تم حفظ الإعدادات',
          description: 'تم تحديث إعدادات الموقع بنجاح',
          variant: 'default'
        })
      }
      
    } catch (error) {
      toast({
        title: 'خطأ في الحفظ',
        description: 'فشل في حفظ الإعدادات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Carousel Settings */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl flex items-center gap-2'>
              <ImageIcon className='h-5 w-5' />
              إعدادات الكاروسيل
            </CardTitle>
            <Button onClick={addCarouselItem} size='sm'>
              <Plus className='h-4 w-4 ml-2' />
              إضافة عنصر
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {carouselItems.map((item, index) => (
            <div key={index} className='border rounded-lg p-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-semibold'>عنصر الكاروسيل {index + 1}</h4>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => removeCarouselItem(index)}
                  disabled={carouselItems.length <= 1}
                >
                  <Trash2 className='h-4 w-4 ml-2' />
                  حذف
                </Button>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor={`carouselTitle${index}`}>العنوان</Label>
                  <Input
                    id={`carouselTitle${index}`}
                    value={item.title}
                    onChange={(e) => handleCarouselChange(index, 'title', e.target.value)}
                    placeholder='عنوان الكاروسيل'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={`carouselButton${index}`}>نص الزر</Label>
                  <Input
                    id={`carouselButton${index}`}
                    value={item.buttonCaption}
                    onChange={(e) => handleCarouselChange(index, 'buttonCaption', e.target.value)}
                    placeholder='نص الزر'
                  />
                </div>
              </div>
              
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>صورة الكاروسيل</Label>
                  <div className='flex items-center gap-4'>
                    {/* Current Image Preview */}
                    <div className='w-32 h-20 rounded-lg overflow-hidden border border-gray-200'>
                      <img
                        src={item.image}
                        alt={`Carousel ${index + 1}`}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>
                    
                    {/* Upload Button */}
                    <div className='space-y-2'>
                      <input
                        type='file'
                        id={`imageUpload${index}`}
                        accept='image/*'
                        className='hidden'
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(index, file)
                          }
                        }}
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => document.getElementById(`imageUpload${index}`)?.click()}
                      >
                        <Upload className='h-4 w-4 ml-2' />
                        رفع صورة جديدة
                      </Button>
                      <p className='text-xs text-muted-foreground'>
                        الصورة الحالية: {item.image}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        رابط الزر: {item.url}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < carouselItems.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='text-xl flex items-center gap-2'>
            <Truck className='h-5 w-5' />
            إعدادات التوصيل
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='deliveryTimeHours'>وقت التوصيل (بالساعات)</Label>
              <Input
                id='deliveryTimeHours'
                type='number'
                min='1'
                value={deliverySettings.deliveryTimeHours}
                onChange={(e) => setDeliverySettings({
                  ...deliverySettings,
                  deliveryTimeHours: parseInt(e.target.value) || 1
                })}
                placeholder='مثال: 4'
              />
              <p className='text-xs text-muted-foreground'>الوقت المتوقع للتوصيل</p>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='deliveryPrice'>سعر التوصيل</Label>
              <Input
                id='deliveryPrice'
                type='number'
                min='0'
                step='0.01'
                value={deliverySettings.deliveryPrice}
                onChange={(e) => setDeliverySettings({
                  ...deliverySettings,
                  deliveryPrice: parseFloat(e.target.value) || 0
                })}
                placeholder='مثال: 4.99'
              />
              <p className='text-xs text-muted-foreground'>سعر التوصيل لكل طلب</p>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='freeShippingThreshold'>حد التوصيل المجاني</Label>
              <Input
                id='freeShippingThreshold'
                type='number'
                min='0'
                step='0.01'
                value={deliverySettings.freeShippingThreshold}
                onChange={(e) => setDeliverySettings({
                  ...deliverySettings,
                  freeShippingThreshold: parseFloat(e.target.value) || 0
                })}
                placeholder='مثال: 50'
              />
              <p className='text-xs text-muted-foreground'>الحد الأدنى للطلب للحصول على توصيل مجاني</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='text-xl flex items-center gap-2'>
            <Calculator className='h-5 w-5' />
            إعدادات الضرائب
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='taxRate'>معدل الضريبة (%)</Label>
                <Input
                  id='taxRate'
                  type='number'
                  min='0'
                  max='100'
                  step='0.1'
                  value={taxSettings.taxRate}
                  onChange={(e) => setTaxSettings({
                    ...taxSettings,
                    taxRate: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='taxExemptThreshold'>حد الإعفاء الضريبي</Label>
                <Input
                  id='taxExemptThreshold'
                  type='number'
                  min='0'
                  step='0.01'
                  value={taxSettings.taxExemptThreshold}
                  onChange={(e) => setTaxSettings({
                    ...taxSettings,
                    taxExemptThreshold: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className='flex items-center space-x-2 rtl:space-x-reverse'>
                <Switch
                  id='taxIncluded'
                  checked={taxSettings.taxIncluded}
                  onCheckedChange={(checked) => setTaxSettings({
                    ...taxSettings,
                    taxIncluded: checked
                  })}
                />
                <Label htmlFor='taxIncluded'>الضريبة مشمولة في السعر</Label>
              </div>
            </div>
            
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='taxExemptCategories'>فئات الإعفاء الضريبي</Label>
                <Textarea
                  id='taxExemptCategories'
                  placeholder='أدخل الفئات مفصولة بفواصل (مثال: prescription-medications, medical-devices)'
                  value={taxSettings.taxExemptCategories.join(', ')}
                  onChange={(e) => setTaxSettings({
                    ...taxSettings,
                    taxExemptCategories: e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat)
                  })}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='text-xl flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            إعدادات تسعير المنتجات
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='defaultMarkup'>الهامش الافتراضي (%)</Label>
              <Input
                id='defaultMarkup'
                type='number'
                min='0'
                step='0.1'
                value={productPricing.defaultMarkup}
                onChange={(e) => setProductPricing({
                  ...productPricing,
                  defaultMarkup: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='bulkDiscountThreshold'>حد الخصم بالجملة</Label>
              <Input
                id='bulkDiscountThreshold'
                type='number'
                min='1'
                value={productPricing.bulkDiscountThreshold}
                onChange={(e) => setProductPricing({
                  ...productPricing,
                  bulkDiscountThreshold: parseInt(e.target.value) || 1
                })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='bulkDiscountRate'>نسبة الخصم بالجملة (%)</Label>
              <Input
                id='bulkDiscountRate'
                type='number'
                min='0'
                max='100'
                step='0.1'
                value={productPricing.bulkDiscountRate}
                onChange={(e) => setProductPricing({
                  ...productPricing,
                  bulkDiscountRate: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>

          {/* Seasonal Discounts */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-semibold text-lg'>الخصومات الموسمية</h4>
              <Button onClick={addSeasonalDiscount} size='sm'>
                <Plus className='h-4 w-4 ml-2' />
                إضافة خصم موسمي
              </Button>
            </div>
            
            <div className='space-y-4'>
              {productPricing.seasonalDiscounts.map((discount, index) => (
                <div key={index} className='border rounded-lg p-4 space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h5 className='font-medium'>الخصم الموسمي {index + 1}</h5>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => removeSeasonalDiscount(index)}
                    >
                      <Trash2 className='h-4 w-4 ml-2' />
                      حذف
                    </Button>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor={`discountName${index}`}>اسم الخصم</Label>
                      <Input
                        id={`discountName${index}`}
                        value={discount.name}
                        onChange={(e) => updateSeasonalDiscount(index, 'name', e.target.value)}
                        placeholder='اسم الخصم'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor={`discountRate${index}`}>نسبة الخصم (%)</Label>
                      <Input
                        id={`discountRate${index}`}
                        type='number'
                        min='0'
                        max='100'
                        step='0.1'
                        value={discount.discountRate}
                        onChange={(e) => updateSeasonalDiscount(index, 'discountRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor={`startDate${index}`}>تاريخ البداية</Label>
                      <Input
                        id={`startDate${index}`}
                        type='date'
                        value={discount.startDate}
                        onChange={(e) => updateSeasonalDiscount(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor={`endDate${index}`}>تاريخ النهاية</Label>
                      <Input
                        id={`endDate${index}`}
                        type='date'
                        value={discount.endDate}
                        onChange={(e) => updateSeasonalDiscount(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor={`applicableCategories${index}`}>الفئات المطبقة</Label>
                    <Textarea
                      id={`applicableCategories${index}`}
                      placeholder='أدخل الفئات مفصولة بفواصل (مثال: vitamins, supplements)'
                      value={discount.applicableCategories.join(', ')}
                      onChange={(e) => updateSeasonalDiscount(index, 'applicableCategories', e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat))}
                      rows={2}
                    />
                  </div>
                  
                  {index < productPricing.seasonalDiscounts.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className='flex justify-end'>
        <Button onClick={handleSubmit} disabled={isLoading} size='lg'>
          <Save className='h-4 w-4 ml-2' />
          {isLoading ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </Button>
      </div>
    </div>
  )
}
