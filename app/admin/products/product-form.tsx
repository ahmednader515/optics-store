'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct, getAllCategories } from '@/lib/actions/product.actions'
import { IProductInput } from '@/types'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { useLoading } from '@/hooks/use-loading'
import { LoadingSpinner } from '@/components/shared/loading-overlay'
import ClientOnly3DPreview from '@/components/shared/client-only-3d-preview'

const productDefaultValues: IProductInput = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: 0,
  listPrice: 0,
  countInStock: 0,
  numReviews: 0,
  avgRating: 0,
  numSales: 0,
  isPublished: false,
  tags: [],
  sizes: [],
  colors: [],
  ratingDistribution: [],
  reviews: [],
  // 3D Model fields
  model3dUrl: undefined,
  model3dScale: 1.0,
  model3dOffsetX: 0.0,
  model3dOffsetY: 0.0,
  model3dOffsetZ: 0.0,
  model3dRotationX: 0.0,
  model3dRotationY: 0.0,
  model3dRotationZ: 0.0,
}

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: IProductInput & { id: string }
  productId?: string
}) => {
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const { isLoading: isSubmitting, withLoading } = useLoading()

  const form = useForm<IProductInput>({
    resolver:
      type === 'Update'
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
    mode: 'onChange',
    shouldFocusError: false,
    shouldUnregister: false,
  })

  // Explicitly register non-visual fields so setValue persists them on submit
  useEffect(() => {
    form.register('model3dUrl')
    form.register('model3dScale')
    form.register('model3dOffsetX')
    form.register('model3dOffsetY')
    form.register('model3dOffsetZ')
    form.register('model3dRotationX')
    form.register('model3dRotationY')
    form.register('model3dRotationZ')
  }, [form])

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
              const categoriesData = await getAllCategories()
        setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }



  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories()
  }, [type, product, productId])

  // Reset form values when product data changes (for updates)
  useEffect(() => {
    if (product && type === 'Update') {
      console.log('Resetting form with product data:', {
        model3dUrl: product.model3dUrl,
        model3dScale: product.model3dScale,
        model3dOffsetX: product.model3dOffsetX,
        model3dOffsetY: product.model3dOffsetY,
        model3dOffsetZ: product.model3dOffsetZ,
        model3dRotationX: product.model3dRotationX,
        model3dRotationY: product.model3dRotationY,
        model3dRotationZ: product.model3dRotationZ,
      })
      form.reset(product)
    }
  }, [product, type, form])



  const { toast } = useToast()
  const onSubmit = async (values: IProductInput) => {
    // Validate that category is selected
    if (!values.category || values.category === '__loading__' || values.category === '__no_categories__') {
      toast({
        variant: 'destructive',
        description: 'يرجى اختيار فئة صحيحة',
      })
      return
    }

    // Validate that at least one image is provided
    if (values.images.length === 0) {
      toast({
        variant: 'destructive',
        description: 'يرجى رفع صورة واحدة على الأقل للمنتج',
      })
      return
    }

    // Auto-generate slug from product name
    const generatedSlug = toSlug(values.name)
    if (!generatedSlug) {
      toast({
        variant: 'destructive',
        description: 'يرجى إدخال اسم المنتج لإنشاء رابط المنتج',
      })
      return
    }

    const productData = {
      ...values,
      slug: generatedSlug
    }

    await withLoading(
      async () => {
        if (type === 'Create') {
          const res = await createProduct(productData)
          if (!res.success) {
            toast({
              variant: 'destructive',
              description: res.message,
            })
          } else {
            toast({
              description: res.message,
            })
            router.push(`/admin/products`)
          }
        }
        if (type === 'Update') {
          if (!productId) {
            router.push(`/admin/products`)
            return
          }
          try {
            const res = await updateProduct({ ...productData, _id: productId })
            
            if (!res.success) {
              toast({
                variant: 'destructive',
                description: res.message,
              })
            } else {
              toast({
                description: res.message,
              })
              router.push(`/admin/products`)
            }
          } catch (error) {
            toast({
              variant: 'destructive',
              description: 'حدث خطأ غير متوقع أثناء التحديث',
            })
          }
        }
      }
    )
  }
  const images = form.watch('images')

  return (
    <div className='rtl' style={{ fontFamily: 'Cairo, sans-serif' }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>اسم المنتج</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                      onChange={(e) => {
                        field.onChange(e)
                        // Auto-generate slug as user types
                        const slug = toSlug(e.target.value)
                        if (slug) {
                          form.setValue('slug', slug)
                        }
                      }}
                    />
                  </FormControl>
                  {field.value && (
                    <div className="text-xs text-gray-500 mt-1">
                      رابط المنتج: {toSlug(field.value) || 'يرجى إدخال اسم صحيح'}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الفئة</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                      <SelectTrigger className='border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'>
                        <SelectValue placeholder={isLoadingCategories ? "جاري التحميل..." : "اختر فئة"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="__loading__" disabled>جاري التحميل...</SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="__no_categories__" disabled>لا توجد فئات متاحة</SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {categories.length === 0 && !isLoadingCategories && (
                    <div className="text-sm text-gray-600 mt-2">
                      <p>لا توجد فئات متاحة. يرجى إضافة فئات من صفحة الإعدادات أولاً.</p>
                      <a 
                        href="/admin/settings" 
                        className="text-orange-600 hover:text-orange-700 underline mt-1 inline-block"
                      >
                        الذهاب إلى الإعدادات
                      </a>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Virtual Try-On image upload (stored in tags as vto=URL) */}
          <div className='flex flex-col gap-2'>
            <FormItem className='w-full'>
              <FormLabel className='text-gray-900 font-semibold'>صورة التجربة الافتراضية (اختياري)</FormLabel>
              <Card>
                <CardContent className='space-y-2 mt-2'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-600'>ارفع صورة إطار شفافة PNG لتظهر على الوجه</div>
                    {Array.isArray(form.watch('tags')) && form.watch('tags').some((t) => t.startsWith('vto=')) && (
                      <button
                        type='button'
                        onClick={() => {
                          const newTags = (form.getValues('tags') || []).filter((t) => !t.startsWith('vto='))
                          form.setValue('tags', newTags)
                        }}
                        className='text-xs text-red-600 hover:underline'
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <FormControl>
                      <UploadButton
                        endpoint='imageUploader'
                        onClientUploadComplete={(res: { url: string }[]) => {
                          const url = res?.[0]?.url
                          if (!url) return
                          const otherTags = (form.getValues('tags') || []).filter((t) => !t.startsWith('vto='))
                          form.setValue('tags', [...otherTags, `vto=${url}`])
                        }}
                        onUploadError={(error: Error) => {
                          toast({ variant: 'destructive', description: `خطأ! ${error.message}` })
                        }}
                      />
                    </FormControl>
                    <div className='text-xs text-gray-500'>PNG بخلفية شفافة يفضل 1000px عرضًا</div>
                  </div>
                  {(() => {
                    const vtoTag = (form.watch('tags') || []).find((t) => t.startsWith('vto='))
                    const vtoUrl = vtoTag ? vtoTag.slice(4) : ''
                    if (!vtoUrl || vtoUrl.trim() === '') return null
                    return (
                      <div className='mt-2'>
                        <Image src={vtoUrl} alt='VTO' width={240} height={120} className='border rounded-md' />
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </FormItem>
          </div>

          {/* 3D Model Upload Section */}
          <div className='flex flex-col gap-2'>
            <FormItem className='w-full'>
              <FormLabel className='text-gray-900 font-semibold'>النموذج ثلاثي الأبعاد (اختياري)</FormLabel>
              <Card>
                <CardContent className='space-y-4 mt-2'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-600'>ارفع ملف .glb أو .gltf للنموذج ثلاثي الأبعاد</div>
                    {form.watch('model3dUrl') && (
                      <button
                        type='button'
                        onClick={() => {
                          form.setValue('model3dUrl', undefined)
                        }}
                        className='text-xs text-red-600 hover:underline'
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <FormControl>
                      <UploadButton
                        endpoint='model3dUploader'
                        onClientUploadComplete={(res: { url: string }[]) => {
                          const url = res?.[0]?.url
                          if (!url) return
                          form.setValue('model3dUrl', url)
                        }}
                        onUploadError={(error: Error) => {
                          toast({ variant: 'destructive', description: `خطأ! ${error.message}` })
                        }}
                      />
                    </FormControl>
                    <div className='text-xs text-gray-500'>ملفات .glb/.gltf حتى 50MB</div>
                  </div>
                  
                  {/* 3D Model Preview and Calibration */}
                  {form.watch('model3dUrl') && (
                    <div className="min-h-[600px]">
                      <ClientOnly3DPreview
                        modelUrl={form.watch('model3dUrl')}
                        scale={form.watch('model3dScale') || 1.0}
                        offsetX={form.watch('model3dOffsetX') || 0.0}
                        offsetY={form.watch('model3dOffsetY') || 0.0}
                        offsetZ={form.watch('model3dOffsetZ') || 0.0}
                        rotationX={form.watch('model3dRotationX') || 0.0}
                        rotationY={form.watch('model3dRotationY') || 0.0}
                        rotationZ={form.watch('model3dRotationZ') || 0.0}
                        onCalibrationChange={(calibration) => {
                          form.setValue('model3dScale', calibration.scale)
                          form.setValue('model3dOffsetX', calibration.offsetX)
                          form.setValue('model3dOffsetY', calibration.offsetY)
                          form.setValue('model3dOffsetZ', calibration.offsetZ)
                          form.setValue('model3dRotationX', calibration.rotationX)
                          form.setValue('model3dRotationY', calibration.rotationY)
                          form.setValue('model3dRotationZ', calibration.rotationZ)
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </FormItem>
          </div>

          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>العلامة التجارية</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='listPrice'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>السعر الأصلي</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>السعر الصافي</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className='border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='countInStock'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الكمية المتوفرة</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      className='border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='images'
              render={() => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الصور</FormLabel>
                  <Card>
                    <CardContent className='space-y-2 mt-2 min-h-48'>
                      {images.length === 0 ? (
                        <div className='flex items-center justify-center h-32 text-gray-500'>
                          لم يتم رفع أي صور بعد
                        </div>
                      ) : (
                        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                          {images.map((image: string, index: number) => (
                            <div
                              key={image}
                              className='relative group cursor-move transition-all duration-200 hover:scale-105'
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString())
                                e.currentTarget.classList.add('opacity-50')
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove('opacity-50')
                              }}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.add('ring-2', 'ring-orange-500')
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('ring-2', 'ring-orange-500')
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                e.currentTarget.classList.remove('ring-2', 'ring-orange-500')
                                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
                                const newImages = [...images]
                                const [draggedImage] = newImages.splice(draggedIndex, 1)
                                newImages.splice(index, 0, draggedImage)
                                form.setValue('images', newImages)
                              }}
                            >
                              <Image
                                src={image}
                                alt={`صورة المنتج ${index + 1}`}
                                className='w-full h-24 object-cover object-center rounded-sm border'
                                width={100}
                                height={100}
                              />
                              <button
                                type='button'
                                onClick={() => {
                                  const newImages = images.filter((_, i) => i !== index)
                                  form.setValue('images', newImages)
                                }}
                                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100'
                              >
                                ×
                              </button>
                              <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1'>
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className='flex flex-col items-center pt-4 space-y-2'>
                        <p className='text-sm text-gray-600 text-center'>
                          {images.length === 0 
                            ? 'ارفع أول صورة للمنتج' 
                            : 'اسحب وأفلت لإعادة ترتيب الصور • انقر على × للحذف'
                          }
                        </p>
                        <FormControl>
                          <UploadButton
                            endpoint='imageUploader'
                            onClientUploadComplete={(res: { url: string }[]) => {
                              form.setValue('images', [...images, res[0].url])
                            }}
                            onUploadError={(error: Error) => {
                              toast({
                                variant: 'destructive',
                                description: `خطأ! ${error.message}`,
                              })
                            }}
                          />
                        </FormControl>
                      </div>
                    </CardContent>
                  </Card>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-gray-900 font-semibold'>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name='isPublished'
              render={({ field }) => (
                <FormItem className='space-x-2 items-center'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='text-gray-900 font-semibold'>منشور؟</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <div>
                  <Button
          type='button'
          size='lg'
          disabled={isSubmitting || categories.length === 0}
          onClick={() => {
            const values = form.getValues()
            onSubmit(values)
          }}
          className='button col-span-2 w-full bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'جاري الإرسال...' : `${type === 'Create' ? 'إنشاء' : 'تحديث'} المنتج`}
        </Button>
        {isSubmitting && (
          <p className='text-sm text-gray-600 text-center'>
            {type === 'Update' ? 'جاري تحديث المنتج...' : 'جاري إنشاء المنتج...'}
          </p>
        )}
        {categories.length === 0 && !isLoadingCategories && (
          <p className='text-sm text-orange-600 text-center'>
            لا يمكن إنشاء منتج بدون فئات. يرجى إضافة فئات من صفحة الإعدادات أولاً.
          </p>
        )}
        </div>
        </form>
      </Form>
    </div>
  )
}

export default ProductForm
