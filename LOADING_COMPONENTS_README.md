# مكونات التحميل - Loading Components

هذا الملف يوضح كيفية استخدام مكونات التحميل الجديدة في الموقع.

## المكونات المتاحة

### 1. LoadingOverlay - شاشة التحميل المتراكبة

مكون يظهر شاشة تحميل متراكبة فوق المحتوى الحالي.

```tsx
import LoadingOverlay from '@/components/shared/loading-overlay'

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div>
      <LoadingOverlay 
        isLoading={isLoading} 
        text="جاري معالجة الطلب..."
      />
      {/* محتوى الصفحة */}
    </div>
  )
}
```

**الخصائص:**
- `isLoading`: boolean - يحدد ما إذا كان يجب عرض شاشة التحميل
- `text`: string - النص المعروض (اختياري)
- `className`: string - classes إضافية (اختياري)

### 2. LoadingSpinner - مؤشر التحميل

مكون صغير لعرض حالة التحميل في الأزرار أو المناطق الصغيرة.

```tsx
import { LoadingSpinner } from '@/components/shared/loading-overlay'

function MyButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <button disabled={isLoading}>
      {isLoading ? (
        <LoadingSpinner size="sm" text="جاري..." />
      ) : (
        'اضغط هنا'
      )}
    </button>
  )
}
```

**الخصائص:**
- `size`: 'sm' | 'md' | 'lg' - حجم المؤشر
- `text`: string - النص المعروض (اختياري)
- `className`: string - classes إضافية (اختياري)

### 3. FullPageLoading - تحميل الصفحة الكاملة

مكون لعرض شاشة تحميل كاملة للصفحة.

```tsx
import { FullPageLoading } from '@/components/shared/loading-overlay'

function MyPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  if (isLoading) {
    return <FullPageLoading text="جاري تحميل الصفحة..." />
  }
  
  return <div>محتوى الصفحة</div>
}
```

**الخصائص:**
- `text`: string - النص المعروض (اختياري)
- `className`: string - classes إضافية (اختياري)

## Hooks المتاحة

### 1. useLoading

Hook لإدارة حالة تحميل واحدة.

```tsx
import { useLoading } from '@/hooks/use-loading'

function MyComponent() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading()
  
  const handleAsyncOperation = async () => {
    try {
      const result = await withLoading(
        async () => {
          // عملية غير متزامنة
          await fetch('/api/data')
          return 'تم بنجاح!'
        },
        (result) => console.log('نجح:', result),
        (error) => console.error('فشل:', error)
      )
    } catch (error) {
      console.error('فشلت العملية:', error)
    }
  }
  
  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />
      <button onClick={handleAsyncOperation}>
        بدء العملية
      </button>
    </div>
  )
}
```

**الخصائص المتاحة:**
- `isLoading`: boolean - حالة التحميل الحالية
- `startLoading()`: function - بدء التحميل
- `stopLoading()`: function - إيقاف التحميل
- `withLoading()`: function - تنفيذ عملية مع إدارة التحميل التلقائي

### 2. useMultiLoading

Hook لإدارة حالات تحميل متعددة.

```tsx
import { useMultiLoading } from '@/hooks/use-loading'

function MyComponent() {
  const { 
    isLoading, 
    startLoading, 
    stopLoading, 
    isAnyLoading 
  } = useMultiLoading()
  
  const handleOperation1 = () => {
    startLoading('operation1')
    setTimeout(() => stopLoading('operation1'), 2000)
  }
  
  const handleOperation2 = () => {
    startLoading('operation2')
    setTimeout(() => stopLoading('operation2'), 3000)
  }
  
  return (
    <div>
      <LoadingOverlay isLoading={isAnyLoading()} />
      <button onClick={handleOperation1} disabled={isLoading('operation1')}>
        العملية الأولى
      </button>
      <button onClick={handleOperation2} disabled={isLoading('operation2')}>
        العملية الثانية
      </button>
    </div>
  )
}
```

## أمثلة الاستخدام

### في الأزرار

```tsx
function SubmitButton() {
  const { isLoading, withLoading } = useLoading()
  
  const handleSubmit = async () => {
    await withLoading(
      async () => {
        await submitForm()
      }
    )
  }
  
  return (
    <button disabled={isLoading}>
      {isLoading ? (
        <LoadingSpinner size="sm" text="جاري الإرسال..." />
      ) : (
        'إرسال'
      )}
    </button>
  )
}
```

### في النماذج

```tsx
function ContactForm() {
  const { isLoading, withLoading } = useLoading()
  
  const handleSubmit = async (data) => {
    await withLoading(
      async () => {
        await submitContactForm(data)
        showSuccessMessage()
      }
    )
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <LoadingOverlay isLoading={isLoading} text="جاري إرسال الرسالة..." />
      {/* حقول النموذج */}
      <button type="submit" disabled={isLoading}>
        إرسال الرسالة
      </button>
    </form>
  )
}
```

### في صفحات البيانات

```tsx
function ProductsPage() {
  const { isLoading, withLoading } = useLoading()
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    const loadProducts = async () => {
      await withLoading(
        async () => {
          const data = await fetchProducts()
          setProducts(data)
        }
      )
    }
    
    loadProducts()
  }, [])
  
  return (
    <div>
      <LoadingOverlay isLoading={isLoading} text="جاري تحميل المنتجات..." />
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## المميزات

✅ **نص عربي**: جميع النصوص باللغة العربية  
✅ **دعم RTL**: تخطيط من اليمين إلى اليسار  
✅ **سهولة الاستخدام**: API بسيط وواضح  
✅ **مرونة**: يمكن تخصيص المظهر والسلوك  
✅ **أداء جيد**: لا يؤثر على أداء التطبيق  
✅ **إمكانية إعادة الاستخدام**: يمكن استخدامه في أي مكان  

## التخصيص

يمكن تخصيص مظهر مكونات التحميل باستخدام CSS classes:

```tsx
<LoadingOverlay 
  isLoading={isLoading} 
  text="جاري التحميل..."
  className="custom-loading-overlay"
/>
```

```css
.custom-loading-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}

.custom-loading-overlay .loading-content {
  background-color: #1f2937;
  color: white;
}
```
