import { Button } from '@/components/ui/button'

export default function SelectVariant({
  variants,
  selectedVariant,
  onVariantChange,
}: {
  variants: Array<{ id: string; name: string; color?: string; size?: string }>
  selectedVariant: string | null
  onVariantChange: (variantId: string) => void
}) {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <div className='font-medium'>Select Variant:</div>
        <div className='grid grid-cols-2 gap-2'>
          {variants.map((variant) => (
            <Button
              key={variant.id}
              variant={selectedVariant === variant.id ? 'default' : 'outline'}
              onClick={() => onVariantChange(variant.id)}
              className='justify-start'
            >
              {variant.color && (
                <div
                  style={{ backgroundColor: variant.color }}
                  className='h-4 w-4 rounded-full border border-muted-foreground mr-2'
                />
              )}
              {variant.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
