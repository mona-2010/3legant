"use client"
import Link from "next/link"
import { GoHeart } from "react-icons/go"
import { GoHeartFill } from "react-icons/go"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setCart } from "@/store/cartSlice"
import { NewLabel, StarRating } from "../layout/ProductSlider"
import { AppDispatch, RootState } from "@/store/store"
import { fetchCart } from "@/lib/cart/fetchCart"
import { addItemToCart } from "@/lib/cart/mutations"
import { toast } from "react-toastify"
import { useAuth } from "@/components/providers/AuthProvider"
import TintedProductImage from "./TintedProductImage"
import { ProductCategory } from "@/types"
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
  selectIsWishlisted,
} from "@/store/wishlistSlice"

export interface Product {
  id: string
  title: string
  price: number
  original_price?: number
  valid_until?: string | null
  image: string
  color?: string[]
  rating?: number
  category?: ProductCategory[]
  is_new?: boolean
  is_active?: boolean
  stock?: number
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const cartItems = useSelector((state: RootState) => state.cart.items)

  const {
    id,
    title,
    price,
    original_price,
    valid_until,
    image,
    color,
    rating = 0,
    is_new
  } = product

  const userId = user?.id ?? null
  const liked = useSelector(selectIsWishlisted(id))
  const offerEnd = valid_until ? new Date(valid_until).getTime() : null
  const hasDiscount = !!(original_price && original_price > price && offerEnd && offerEnd > Date.now())
  const primaryColor = Array.isArray(color) ? color[0] : undefined
  const currentProductQty = cartItems
    .filter((item) => item.product_id === id)
    .reduce((sum, item) => sum + item.quantity, 0)
  const isStockLimitReached = typeof product.stock === "number" && currentProductQty >= product.stock

  useEffect(() => {
    if (!userId) return
    dispatch(fetchWishlist({ userId }))
  }, [dispatch, userId])


  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      toast.error("Login to add items to wishlist")
      return
    }

    if (liked) {
      const result = await dispatch(removeFromWishlist({ userId, productId: id }))
      if (removeFromWishlist.fulfilled.match(result)) {
        toast.info("Removed from wishlist")
      } else {
        toast.error((result.payload as string) || "Could not remove from wishlist")
      }

    } else {
      const result = await dispatch(addToWishlist({ userId, productId: id }))
      if (addToWishlist.fulfilled.match(result)) {
        toast.success("Added to wishlist")
      } else {
        toast.error((result.payload as string) || "Could not add to wishlist")
      }
    }
  }

  const addProductToCart = async () => {
    if (!user) {
      toast.error("Login to add items to cart")
      return
    }

    const normalizedColors = Array.isArray(color) ? color : []
    const selectedColorName = normalizedColors[0] ?? null

    if (isStockLimitReached) {
      toast.error("Stock limit exceeded")
      return
    }

    const added = await addItemToCart({
      userId: user.id,
      productId: product.id,
      quantity: 1,
      color: selectedColorName,
    })

    if (!added) {
      toast.error("Stock limit exceeded")
      return
    }

    const items = await fetchCart(user.id)
    dispatch(setCart(items))
    toast.success(`${title} added to cart`)
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white py-4 block"
    >

      <div className="relative w-full h-[320px] border border-lightgray rounded-xl">
        <NewLabel
          price={price}
          originalPrice={original_price}
          validUntil={valid_until}
          isNew={is_new}
        />

        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100"
        >
          {liked ? (
            <GoHeartFill className="text-2xl transition text-red-500" />
          ) : (
            <GoHeart className="text-2xl transition text-gray-500" />
          )}
        </button>

        <TintedProductImage
          src={image}
          alt={title}
          fill
          colorHex={primaryColor}
          className="object-contain p-6 mix-blend-multiply"
        />

        {(!product.is_active || product.stock === 0) ? (
          <div className="w-[85%] py-2 text-center rounded-xl absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-500 opacity-100 cursor-not-allowed select-none">
            Out of Stock
          </div>
        ) : isStockLimitReached ? (
          <div className="w-[85%] py-2 text-center rounded-xl absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-500 opacity-100 cursor-not-allowed select-none">
            Stock Limit Reached
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addProductToCart()
            }}
            className="w-[85%] py-2 text-center rounded-xl absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white opacity-0 group-hover:opacity-100"
          >
            Add to cart
          </button>
        )}
      </div>

      <div className="mt-4">
        <StarRating rating={Math.round((rating || 0) * 2) / 2} />
        <p className="text-lg font-semibold mt-1">{title}</p>

        <div className="flex gap-3 font-bold mt-2">
          <p>${price.toFixed(2)}</p>

          {hasDiscount && (
            <p className="text-gray-200 line-through">
              ${original_price!.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}