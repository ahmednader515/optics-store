import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IProductInput } from "@/types";
import Rating from "./rating";
import { formatNumber, generateId, round2 } from "@/lib/utils";
import ProductPrice from "./product-price";
import ImageHover from "./image-hover";
import { Eye } from "lucide-react";

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
}: {
  product: IProductInput & { id: string };
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
}) => {
  const ProductImage = () => (
    <div className="relative group">
      <Link href={`/product/${product.slug}`}>
        <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-lg bg-gray-50">
          {product.images.length > 1 ? (
            <ImageHover
              src={product.images[0]}
              hoverSrc={product.images[1]}
              alt={product.name}
            />
          ) : (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          )}
          
          {/* Quick action buttons overlay */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </button>
          </div>
          
          {/* Stock status badge */}
          {product.countInStock <= 10 && product.countInStock > 0 && (
            <Badge variant="destructive" className="absolute top-2 sm:top-3 right-2 sm:right-3 text-xs">
              آخر {product.countInStock} قطع
            </Badge>
          )}
          {product.countInStock === 0 && (
            <Badge variant="secondary" className="absolute top-2 sm:top-3 right-2 sm:right-3 text-xs bg-gray-500">
              نفذت الكمية
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );

  const ProductDetails = () => (
    <div className="flex-1 space-y-3 sm:space-y-4 p-3 sm:p-4" dir="rtl">
      {/* Product Name */}
      <Link
        href={`/product/${product.slug}`}
        className="block group"
      >
        <h3 
          className="font-semibold text-gray-900 text-right leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 text-sm sm:text-base"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </h3>
      </Link>

      {/* Rating and Reviews - Clean Number Design */}
      <div className="flex flex-col items-start gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs text-gray-500">التقييم:</span>
          <div className="bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
            {product.avgRating && !isNaN(product.avgRating) ? product.avgRating.toFixed(1) : '0.0'}
          </div>
        </div>
        <span className="text-xs text-gray-500 text-left">
          ({product.numReviews && !isNaN(product.numReviews) ? formatNumber(product.numReviews) : '0'} تقييم)
        </span>
      </div>

      {/* Price */}
      <div className="text-left">
        <ProductPrice
          price={product.price}
          originalPrice={product.listPrice}
          className="items-start"
        />
      </div>
    </div>
  );

  const AddButton = () => (
    <div className="p-3 sm:p-4 pt-0">
      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 sm:py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        إضافة للسلة
      </button>
    </div>
  );

  if (hideBorder) {
    return (
      <div className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group" dir="rtl">
        <ProductImage />
        {!hideDetails && (
          <>
            <ProductDetails />
            {!hideAddToCart && <AddButton />}
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border-0" dir="rtl">
      <ProductImage />
      {!hideDetails && (
        <>
          <ProductDetails />
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </Card>
  );
};

export default ProductCard;
