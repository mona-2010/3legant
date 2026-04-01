"use client"

import Link from "next/link"
import { GoHeart, GoHeartFill } from "react-icons/go"
import { StarRating } from "./StarRating"
import TintedProductImage from "./TintedProductImage"

type Product = {
  id: string
  title: string
  description?: string
  price: number
  original_price?: number
  valid_until?: string | null
  image: string
  color?: string[]
  rating?: number
  is_new?: boolean
  is_active?: boolean
  stock?: number
}

type Props = {
  product: Product
  grid: "1" | "2"
  liked: boolean
  onWishlist: (e: React.MouseEvent, productId: string) => void
  onAddToCart: (e: React.MouseEvent, id: string, title: string, color?: string[], stock?: number) => void
  currentProductQty: number
}

export default function ProductListItem({ product, grid, liked, onWishlist, onAddToCart, currentProductQty }: Props) {
  const { id, title, description, price, original_price, valid_until, image, color, rating = 0, is_new = false } = product
  const offerEnd = valid_until ? new Date(valid_until).getTime() : null
  const hasDiscount = !!(original_price && original_price > price && offerEnd && offerEnd > Date.now())
  const discountPercentage = hasDiscount ? Math.round(((original_price! - price) / original_price!) * 100) : 0
  const primaryColor = Array.isArray(color) ? color[0] : undefined
  const isStockLimitReached = typeof product.stock === "number" && currentProductQty >= product.stock
  const isOutOfStock = !product.is_active || product.stock === 0

  const labels = (is_new || hasDiscount) && (
    <div className="absolute top-0 left-0 right-0 flex justify-between z-10 w-fit p-4 font-bold flex flex-col">
      {is_new && <p className="px-2 text-sm text-black bg-white rounded-sm mb-2">NEW</p>}
      {hasDiscount && <p className="px-2 text-sm text-white bg-green-500 rounded-sm">-{discountPercentage}%</p>}
    </div>
  )

  const priceBlock = (
    <div className="flex items-center gap-2 font-bold mt-2">
      <p className="text-[12px] md:text-[16px] text-black">${price.toFixed(2)}</p>
      {hasDiscount && <p className="text-[12px] md:text-[16px] text-gray-200 line-through">${original_price?.toFixed(2)}</p>}
    </div>
  )

  const wishlistBtn = (
    <div className="flex justify-center w-full lg:w-[50%] mt-2">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(e, id) }}
        className="flex items-center"
      >
        {liked ? (
          <GoHeartFill className="text-3xl bg-white p-2 md:p-1 rounded-full transition text-red-500" />
        ) : (
          <GoHeart className="text-3xl bg-white p-2 md:p-1 rounded-full transition text-gray-500" />
        )}
        <p className="text-[12px] md:text-[16px]">Wishlist</p>
      </button>
    </div>
  )

  if (grid === "1") {
    return (
      <Link href={`/product/${id}`} className="group bg-white py-4 block">
        <div className="flex flex-col md:flex-row gap-8 p-0 md:p-6 group bg-white items-center">
          <div className="relative w-full md:w-[220px] h-[220px] rounded-xl">
            {labels}
            <TintedProductImage src={image} alt={title} fill colorHex={primaryColor} className="object-contain p-6 mix-blend-multiply" />
          </div>
          <div className="flex flex-col w-full flex-1">
            <StarRating rating={Math.round((rating || 0) * 2) / 2} />
            <p className="text-2xl font-semibold mt-2">{title}</p>
            {description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>}
            {priceBlock}
            <button
              onClick={(e) => onAddToCart(e, id, title, color, product.stock)}
              className="mt-4 px-6 py-2 bg-black text-white w-full md:w-[40%] rounded-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={isOutOfStock || isStockLimitReached}
            >
              {isOutOfStock ? "Out of Stock" : isStockLimitReached ? "Stock Limit Reached" : "Add to cart"}
            </button>
            <div className="flex justify-center w-full md:w-[40%] mt-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(e, id) }}
                className="flex items-center"
              >
                {liked ? (
                  <GoHeartFill className="text-3xl bg-white p-2 md:p-1 rounded-full transition text-red-500" />
                ) : (
                  <GoHeart className="text-3xl bg-white p-2 md:p-1 rounded-full transition text-gray-500" />
                )}
                <p className="text-[12px] md:text-[16px]">Wishlist</p>
              </button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/product/${id}`} className="group bg-white pt-4 block">
      <div className="flex flex-col md:flex-row gap-6 group bg-white">
        <div className="relative w-full md:min-w-[180px] md:max-w-[180px] lg:min-w-[225px] min-h-[200px] md:min-h-[250px] border border-lightgray rounded-xl">
          {labels}
          <TintedProductImage src={image} alt={title} fill colorHex={primaryColor} className="object-contain p-4 mix-blend-multiply" />
        </div>
        <div className="flex flex-col flex-1">
          <StarRating rating={Math.round((rating || 0) * 2) / 2} />
          <p className="text-lg font-semibold mt-1 line-clamp-1">{title}</p>
          {description && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{description}</p>}
          {priceBlock}
          <div className="w-full">
            <button
              onClick={(e) => onAddToCart(e, id, title, color, product.stock)}
              className="mt-4 px-0 py-2 text-[12px] md:text-[16px] bg-black text-white w-full lg:w-[50%] rounded-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={isOutOfStock || isStockLimitReached}
            >
              {isOutOfStock ? "Out of Stock" : isStockLimitReached ? "Stock Limit Reached" : "Add to cart"}
            </button>
          </div>
          {wishlistBtn}
        </div>
      </div>
    </Link>
  )
}