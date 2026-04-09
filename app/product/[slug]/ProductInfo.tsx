"use client"

import Link from "next/link"
import { GoHeart, GoHeartFill } from "react-icons/go"
import { StarRating } from "@/components/layout/StarRating"
import { ProductCategory } from "@/types"
import { HiMinus, HiPlus } from "react-icons/hi"
import { getEffectiveProductPrice, hasActiveDiscount } from "@/lib/utils/product-pricing"

type ProductInfoProps = {
  product: {
    id: string
    title: string
    description: string
    price: number
    original_price?: number
    valid_until?: string | null
    category: ProductCategory[]
    rating: number
    review_count?: number
    color?: string[]
    sku?: string
    measurements?: string | null
    weight?: string | null
    is_active?: boolean
    stock?: number
  }
  timeLeft: { days: number; hours: number; minutes: number; seconds: number }
  selectedColorIndex: number | null
  setSelectedColorIndex: (index: number | null) => void
  quantity: number
  updateQuantity: (type: "inc" | "dec") => void
  liked: boolean
  toggleWishlist: (color?: string | null) => void
  addToCartHandler: () => void
  isAddingToCart: boolean
  isStockLimitReached: boolean
  isSelectedVariantInCart: boolean
}

export default function ProductInfo({
  product, timeLeft, selectedColorIndex, setSelectedColorIndex,
  quantity, updateQuantity, liked, toggleWishlist, addToCartHandler, isAddingToCart, isStockLimitReached, isSelectedVariantInCart,
}: ProductInfoProps) {
  const isDiscountActive = hasActiveDiscount(product)
  const effectivePrice = getEffectiveProductPrice(product)
  const effectiveOriginalPrice = isDiscountActive ? product.original_price : 0

  return (
    <div className="md:w-1/2 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <StarRating rating={Math.round((product.rating || 0) * 2) / 2} />
        <p>{product.review_count || 0} Reviews</p>
      </div>

      <h1 className="font-poppins text-[32px] lg:text-[40px]">{product.title}</h1>
      <p className="text-gray-200 w-[90%] leading-[26px]">{product.description}</p>
      <div className="flex items-center gap-3 font-poppins font-[500]">
        <p className="text-[28px]">${effectivePrice}</p>
        {isDiscountActive ? (
          <p className="text-[20px] text-gray-200 line-through">${effectiveOriginalPrice}</p>
        ) : null}
      </div>

        {isDiscountActive ? (
          <>
            <p>Offer expires in:</p>
            <div className="flex gap-3 py-6 flex-wrap">
              {Object.entries(timeLeft).map(([label, value]) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="bg-gray-100 px-3 md:px-5 py-2 text-xl md:text-2xl lg:text-3xl font-semibold">
                    {value.toString().padStart(2, "0")}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          ""
        )}

      <div className="border-b border-lightgray pb-5">
        <p className="text-xl text-gray-200">Measurements</p>
        <p className="text-[20px]">{product.measurements || "Not specified"}</p>
      </div>

      {product.color && product.color.length > 0 && (
        <div className="flex flex-col gap-3 py-4 border-b border-lightgray">
          <div className="flex flex-col gap-3 pb-3">
            <p className="text-[16px] font-semibold">Color</p>
            <p className="text-sm text-gray-400">
              {selectedColorIndex !== null ? product.color[selectedColorIndex] : "Select a color"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {product.color.map((hex, index) => {
              const isActive = selectedColorIndex === index
              return (
                <button
                  key={index}
                  title={hex}
                  aria-label={`Select color ${hex}`}
                  aria-pressed={isActive}
                  onClick={() => setSelectedColorIndex(index)}
                  className="cursor-pointer relative w-8 h-8 rounded-full border-2 transition-all duration-150 focus:outline-none"
                  style={{
                    backgroundColor: hex,
                    borderColor: isActive ? "#171616" : "#d1d5db",
                    boxShadow: isActive ? "0 0 0 3px #fff" : "0 1px 3px rgba(0,0,0,0.15)",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-6">
        <div className="bg-gray-100 flex items-center px-5 md:px-10 py-3">
          <button
            onClick={() => updateQuantity("dec")}
            disabled={quantity <= 1}
            className={quantity <= 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          >
            <HiMinus />
          </button>
          <span className="px-4 text-lg">{quantity}</span>
          <button
            onClick={() => updateQuantity("inc")}
            disabled={typeof product.stock === "number" && quantity >= product.stock}
            className={typeof product.stock === "number" && quantity >= product.stock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          >
            <HiPlus />
          </button>
        </div>
        <button
          onClick={() => {
            const selectedColor = selectedColorIndex !== null ? product.color?.[selectedColorIndex] ?? null : null
            toggleWishlist(selectedColor)
          }}
          className="cursor-pointer border-2 rounded-lg w-full py-3 flex items-center justify-center gap-1"
        >
          {liked ? (
            <GoHeartFill className="text-3xl bg-white p-2 md:p-1 rounded-full transition text-red-500" /> 
          ) : (
            <GoHeart className="text-3xl bg-white p-2 md:p-1 rounded-full transition text-gray-500" />
          )}
          {liked ? "Wishlisted" : "Wishlist"}
        </button>
      </div>

      {(!product.is_active || product.stock === 0) ? (
        <div className="w-full rounded-lg bg-gray-300 text-gray-500 text-center py-3 cursor-not-allowed select-none">
          Out of Stock
        </div>
      ) : isStockLimitReached ? (
        <div className="w-full rounded-lg bg-gray-300 text-gray-500 text-center py-3 cursor-not-allowed select-none">
          Stock Limit Reached
        </div>
      ) : (
        <button
          onClick={addToCartHandler}
          disabled={isAddingToCart}
          className="w-full rounded-lg bg-black text-white text-center py-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? "Saving..." : isSelectedVariantInCart ? "Add to cart" : "Add to cart"}
        </button>
      )}

      <div className="mt-5 flex flex-col gap-2 text-gray-200 text-sm">
        {product.sku && (
          <p className="flex gap-10 uppercase">
            SKU <span className="text-black">{product.sku}</span>
          </p>
        )}
        <p className="flex flex-wrap items-center gap-2 uppercase">
          Category
          {product.category.map((cat, index) => (
            <Link
              key={index}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="text-black capitalize hover:underline"
            >
              {cat}
            </Link>
          ))}
        </p>
      </div>
    </div>
  )
}
