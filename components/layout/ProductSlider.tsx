"use client"

import ProductCard from "./ProductCard"
import { useEffect } from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { upsertCartItem } from "@/store/cartSlice"
import { AppDispatch, RootState } from "@/store/store"
import { addItemToCart } from "@/lib/cart/mutations"
import { toast } from "react-toastify"
import ProductListItem from "./ProductListItem"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { fetchWishlist, addToWishlist, removeFromWishlist, selectWishlistProductIds } from "@/store/wishlistSlice"
export { StarRating } from "./StarRating"
export { NewLabel } from "./NewLabel"

interface Product {
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

interface Props {
  products: Product[]
  grid: "1" | "2" | "3" | "4"
}

const ProductSlider = ({ products, grid }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useAuth()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const wishlistProductIds = useSelector(selectWishlistProductIds)
  const [addingProductId, setAddingProductId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    dispatch(fetchWishlist({ userId: user.id }))
  }, [user, dispatch])

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push("/sign-in"); return }

    const isLiked = wishlistProductIds.includes(productId)
    if (isLiked) {
      dispatch(removeFromWishlist({ userId: user.id, productId }))
    } else {
      dispatch(addToWishlist({ userId: user.id, productId }))
    }
  }

  const addToCartHandler = async (
    e: React.MouseEvent,
    productId: string,
    productTitle: string,
    productColor?: string[],
    productStock?: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push("/sign-in"); return }
    if (addingProductId) return
    const currentProductQty = cartItems
      .filter((item) => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (typeof productStock === "number" && currentProductQty >= productStock) {
      toast.error("Stock limit exceeded")
      return
    }
    const normalizedColors = Array.isArray(productColor) ? productColor : []
    setAddingProductId(productId)
    try {
      const result = await addItemToCart({ userId: user.id, productId, quantity: 1, color: normalizedColors[0] ?? null })
      if (!result.success || !result.item) { toast.error("Stock limit exceeded"); return }
      const product = products.find((item) => item.id === productId)
      if (product) {
        dispatch(upsertCartItem({
          id: result.item.id,
          product_id: result.item.product_id,
          name: productTitle,
          image: product.image,
          price: product.price,
          quantity: result.item.quantity,
          color: result.item.color ?? undefined,
          stock: product.stock,
        }))
      }
      toast.success(`${productTitle} added to cart`)
    } finally {
      setAddingProductId(null)
    }
  }

  return (
    <div
      className={`grid gap-4 md:gap-6 lg:gap-8 ${
        grid === "4" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : grid === "3" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
          : grid === "2" ? "grid-cols-2 sm:grid-cols-2"
          : "grid-cols-1"
      }`}
    >
      {products.map((product) => {
        if (grid === "1" || grid === "2") {
          return (
            <div key={product.id}>
              <ProductListItem
                product={product}
                grid={grid}
                liked={wishlistProductIds.includes(product.id)}
                onWishlist={handleWishlist}
                onAddToCart={addToCartHandler}
                isAddingToCart={addingProductId === product.id}
                currentProductQty={cartItems
                  .filter((item) => item.product_id === product.id)
                  .reduce((sum, item) => sum + item.quantity, 0)}
              />
            </div>
          )
        }
        return (
          <div key={product.id} className="group bg-white">
            <ProductCard product={product} />
          </div>
        )
      })}
    </div>
  )
}

export default ProductSlider
