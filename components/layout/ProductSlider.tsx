"use client"

import ProductCard from "./ProductCard"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setCart } from "@/store/cartSlice"
import { AppDispatch, RootState } from "@/store/store"
import { fetchCart } from "@/lib/cart/fetchCart"
import { addItemToCart } from "@/lib/cart/mutations"
import { toast } from "react-toastify"
import ProductListItem from "./ProductListItem"
import { useAuth } from "@/components/providers/AuthProvider"
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
  const { user } = useAuth()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const wishlistProductIds = useSelector(selectWishlistProductIds)

  useEffect(() => {
    if (!user) return
    dispatch(fetchWishlist({ userId: user.id }))
  }, [user, dispatch])

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error("Please login to add items to wishlist"); return }

    const isLiked = wishlistProductIds.includes(productId)
    if (isLiked) {
      dispatch(removeFromWishlist({ userId: user.id, productId }))
      toast.info("Removed from wishlist")
    } else {
      dispatch(addToWishlist({ userId: user.id, productId }))
      toast.success("Added to wishlist")
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
    if (!user) { toast.error("Please login to add items to cart"); return }
    const currentProductQty = cartItems
      .filter((item) => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (typeof productStock === "number" && currentProductQty >= productStock) {
      toast.error("Stock limit exceeded")
      return
    }
    const normalizedColors = Array.isArray(productColor) ? productColor : []
    const added = await addItemToCart({ userId: user.id, productId, quantity: 1, color: normalizedColors[0] ?? null })
    if (!added) { toast.error("Stock limit exceeded"); return }
    const items = await fetchCart(user.id)
    dispatch(setCart(items))
    toast.success(`${productTitle} added to cart`)
  }

  return (
    <div
      className={`grid gap-4 md:gap-6 lg:gap-8 ${
        grid === "4" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
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
                currentProductQty={cartItems
                  .filter((item) => item.product_id === product.id)
                  .reduce((sum, item) => sum + item.quantity, 0)}
              />
            </div>
          )
        }
        return (
          <div key={product.id} className="group bg-white p-4">
            <ProductCard product={product} />
          </div>
        )
      })}
    </div>
  )
}

export default ProductSlider
