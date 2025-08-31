'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit, Save, X, GripVertical } from 'lucide-react'
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getAllCategories,
  reorderCategories,
  type ICategoryInput 
} from '@/lib/actions/category.actions'

interface Category {
  id: string
  name: string
  description: string
  slug: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newCategory, setNewCategory] = useState<ICategoryInput>({
    name: '',
    description: '',
    slug: '',
    isActive: true,
    sortOrder: 0
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: 'خطأ في تحميل الفئات',
        description: 'فشل في تحميل قائمة الفئات',
        variant: 'destructive'
      })
    }
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setNewCategory({
      name: '',
      description: '',
      slug: '',
      isActive: true,
      sortOrder: categories.length
    })
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
    setNewCategory({
      name: '',
      description: '',
      slug: '',
      isActive: true,
      sortOrder: 0
    })
  }

  const handleSaveNew = async () => {
    if (!newCategory.name.trim() || !newCategory.slug.trim()) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال اسم الفئة ورابط الفئة',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createCategory(newCategory)
      if (result.success) {
        toast({
          title: 'تم إنشاء الفئة',
          description: result.message,
          variant: 'default'
        })
        setIsAddingNew(false)
        setNewCategory({
          name: '',
          description: '',
          slug: '',
          isActive: true,
          sortOrder: 0
        })
        loadCategories()
      } else {
        toast({
          title: 'خطأ في إنشاء الفئة',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ في إنشاء الفئة',
        description: 'فشل في إنشاء الفئة',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
  }

  const handleSaveEdit = async () => {
    if (!editingCategory) return

    if (!editingCategory.name.trim() || !editingCategory.slug.trim()) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال اسم الفئة ورابط الفئة',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await updateCategory({
        id: editingCategory.id,
        name: editingCategory.name,
        description: editingCategory.description,
        slug: editingCategory.slug,
        isActive: editingCategory.isActive,
        sortOrder: editingCategory.sortOrder
      })
      
      if (result.success) {
        toast({
          title: 'تم تحديث الفئة',
          description: result.message,
          variant: 'default'
        })
        setEditingCategory(null)
        loadCategories()
      } else {
        toast({
          title: 'خطأ في تحديث الفئة',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ في تحديث الفئة',
        description: 'فشل في تحديث الفئة',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return

    setIsLoading(true)
    try {
      const result = await deleteCategory(id)
      if (result.success) {
        toast({
          title: 'تم حذف الفئة',
          description: result.message,
          variant: 'default'
        })
        loadCategories()
      } else {
        toast({
          title: 'خطأ في حذف الفئة',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ في حذف الفئة',
        description: 'فشل في حذف الفئة',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(fromIndex, 1)
    newCategories.splice(toIndex, 0, movedCategory)
    
    // Update sort order
    const reorderedCategories = newCategories.map((cat, index) => ({
      ...cat,
      sortOrder: index
    }))
    
    setCategories(reorderedCategories)
    
    try {
      await reorderCategories(reorderedCategories.map(cat => cat.id))
    } catch (error) {
      console.error('Error reordering categories:', error)
      // Revert on error
      loadCategories()
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl flex items-center gap-2'>
            <GripVertical className='h-5 w-5' />
            إدارة الفئات
          </CardTitle>
          <Button onClick={handleAddNew} size='sm' disabled={isAddingNew}>
            <Plus className='h-4 w-4 ml-2' />
            إضافة فئة جديدة
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Add New Category Form */}
        {isAddingNew && (
          <div className='border rounded-lg p-4 space-y-4 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <h4 className='font-semibold'>إضافة فئة جديدة</h4>
              <Button variant='ghost' size='sm' onClick={handleCancelAdd}>
                <X className='h-4 w-4' />
              </Button>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='newCategoryName'>اسم الفئة *</Label>
                <Input
                  id='newCategoryName'
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setNewCategory({
                      ...newCategory,
                      name,
                      slug: generateSlug(name)
                    })
                  }}
                  placeholder='اسم الفئة'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='newCategorySlug'>رابط الفئة *</Label>
                <Input
                  id='newCategorySlug'
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    slug: e.target.value
                  })}
                  placeholder='رابط-الفئة'
                />
              </div>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='newCategoryDescription'>وصف الفئة</Label>
              <Textarea
                id='newCategoryDescription'
                value={newCategory.description}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  description: e.target.value
                })}
                placeholder='وصف الفئة (اختياري)'
                rows={2}
              />
            </div>
            
            <div className='flex items-center space-x-2 space-x-reverse'>
              <Switch
                id='newCategoryActive'
                checked={newCategory.isActive}
                onCheckedChange={(checked) => setNewCategory({
                  ...newCategory,
                  isActive: checked
                })}
              />
              <Label htmlFor='newCategoryActive'>فئة نشطة</Label>
            </div>
            
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={handleCancelAdd}>
                إلغاء
              </Button>
              <Button onClick={handleSaveNew} disabled={isLoading}>
                <Save className='h-4 w-4 ml-2' />
                {isLoading ? 'جاري الحفظ...' : 'حفظ الفئة'}
              </Button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className='space-y-4'>
          {categories.map((category, index) => (
            <div key={category.id} className='border rounded-lg p-4 space-y-4'>
              {editingCategory?.id === category.id ? (
                // Edit Mode
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold'>تعديل الفئة: {category.name}</h4>
                    <Button variant='ghost' size='sm' onClick={handleCancelEdit}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor={`editName${category.id}`}>اسم الفئة *</Label>
                      <Input
                        id={`editName${category.id}`}
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          name: e.target.value
                        })}
                        placeholder='اسم الفئة'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor={`editSlug${category.id}`}>رابط الفئة *</Label>
                      <Input
                        id={`editSlug${category.id}`}
                        value={editingCategory.slug}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          slug: e.target.value
                        })}
                        placeholder='رابط-الفئة'
                      />
                    </div>
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor={`editDescription${category.id}`}>وصف الفئة</Label>
                    <Textarea
                      id={`editDescription${category.id}`}
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        description: e.target.value
                      })}
                      placeholder='وصف الفئة (اختياري)'
                      rows={2}
                    />
                  </div>
                  
                  <div className='flex items-center space-x-2 space-x-reverse'>
                    <Switch
                      id={`editActive${category.id}`}
                      checked={editingCategory.isActive}
                      onCheckedChange={(checked) => setEditingCategory({
                        ...editingCategory,
                        isActive: checked
                      })}
                    />
                    <Label htmlFor={`editActive${category.id}`}>فئة نشطة</Label>
                  </div>
                  
                  <div className='flex justify-end gap-2'>
                    <Button variant='outline' onClick={handleCancelEdit}>
                      إلغاء
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isLoading}>
                      <Save className='h-4 w-4 ml-2' />
                      {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <GripVertical className='h-4 w-4 text-gray-400 cursor-move' />
                      <h4 className='font-semibold'>{category.name}</h4>
                      {!category.isActive && (
                        <span className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full'>
                          غير نشطة
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className='h-4 w-4 ml-2' />
                        تعديل
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDelete(category.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className='h-4 w-4 ml-2' />
                        حذف
                      </Button>
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium text-gray-600'>الرابط:</span>
                      <span className='ml-2 font-mono bg-gray-100 px-2 py-1 rounded'>
                        {category.slug}
                      </span>
                    </div>
                    <div>
                      <span className='font-medium text-gray-600'>الترتيب:</span>
                      <span className='ml-2'>{category.sortOrder + 1}</span>
                    </div>
                  </div>
                  
                  {category.description && (
                    <div>
                      <span className='font-medium text-gray-600'>الوصف:</span>
                      <p className='mt-1 text-gray-700'>{category.description}</p>
                    </div>
                  )}
                  
                  <div className='text-xs text-gray-500'>
                    تم الإنشاء: {new Date(category.createdAt).toLocaleDateString('ar-SA')}
                    {category.updatedAt !== category.createdAt && (
                      <span className='mr-4'>
                        آخر تحديث: {new Date(category.updatedAt).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {categories.length === 0 && !isAddingNew && (
            <div className='text-center py-8 text-gray-500'>
              لا توجد فئات حالياً. ابدأ بإضافة فئة جديدة.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
