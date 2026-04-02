"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RxCross1 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { setCart } from "@/store/cartSlice"
import { AppDispatch, RootState } from "@/store/store"
import { fetchCart } from "@/lib/cart/fetchCart"
import { addItemToCart } from "@/lib/cart/mutations"
import { toast } from "react-toastify"
import { useAuth } from "@/components/providers/AuthProvider"
import TintedProductImage from "../layout/TintedProductImage"
import WishlistSkeleton from "../common/WishlistSkeleton"
import { removeFromWishlist, setWishlistProductIds } from "@/store/wishlistSlice"

interface WishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    title: string
    price: number
    original_price?: number
    image: string
    color?: string[]
    is_active?: boolean
    stock?: number
  }
}

const WishlistPage = () => {
  const supabase = createClient()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const cartItems = useSelector((state: RootState) => state.cart.items)

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select(`
        id,
        product_id,
        products!wishlist_product_fk (
          id,
          title,
          price,
          original_price,
          image,
          color,
          is_active,
          stock
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      console.error(error)
    } else {
      const nextItems = data as unknown as WishlistItem[]
      setItems(nextItems)
      dispatch(setWishlistProductIds(nextItems.map((item) => item.product_id)))
    }

    setLoading(false)
  }

  useEffect(() => {
    // Only show full loading skeleton if we have no items yet.
    if (items.length === 0) {
      setLoading(true)
    }
    fetchWishlist()
  }, [user])

  const removeItem = async (wishlistId: string, productId: string) => {
    if (!user) return
    await dispatch(removeFromWishlist({ userId: user.id, productId }))
    setItems((prev) => prev.filter((item) => item.id !== wishlistId))
    toast.info("Removed from wishlist")
  }

  if (loading) return <WishlistSkeleton />
  if (items.length === 0) return <p className="text-gray-500">Your wishlist is empty.</p>

  return (
    <div className="w-full mb-10">
      <h2 className="text-2xl font-semibold mb-6">Your Wishlist</h2>

      <div className="grid grid-cols-[3fr_1fr_1fr] text-gray-500 border-b border-lightgray pb-3">
        <p className="md:pl-20">Product</p>
        <p className="hidden md:block">Price</p>
        <p className="hidden md:block">Action</p>
      </div>

      {items.map((item) => {
        const product = item.products
        if (!product) return null

        const currentProductQty = cartItems
          .filter((cartItem) => cartItem.product_id === product.id)
          .reduce((sum, cartItem) => sum + cartItem.quantity, 0)
        const isStockLimitReached =
          typeof product.stock === "number" && currentProductQty >= product.stock

        const ActionButton = () => {
          if (!product.is_active || product.stock === 0) {
            return (
              <div className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md w-fit cursor-not-allowed select-none text-sm">
                Out of Stock
              </div>
            )
          }
          if (isStockLimitReached) {
            return (
              <div className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md w-fit cursor-not-allowed select-none text-sm">
                Stock Limit Reached
              </div>
            )
          }
          return (
            <button
              onClick={async () => {
                if (!user) { toast.error("Login to add items to cart"); return }
                if (isStockLimitReached) { toast.error("Stock limit exceeded"); return }

                const added = await addItemToCart({
                  userId: user.id,
                  productId: product.id,
                  quantity: 1,
                  color: product.color?.[0] ?? null,
                })

                if (!added) { toast.error("Stock limit exceeded"); return }

                const items = await fetchCart(user.id)
                dispatch(setCart(items))
                toast.success(`${product.title} added to cart`)
              }}
              className="bg-black text-white px-4 py-2 rounded-md text-sm w-full md:w-fit"
            >
              Add to cart
            </button>
          )
        }

        return (
          <div key={item.id} className="border-b border-lightgray py-6">
            <div
              className="grid sm:grid-cols-[3fr_1fr] md:grid-cols-[3fr_1fr_1fr] items-center"
            >
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => removeItem(item.id, item.product_id)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <RxCross1 />
                </button>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                  <TintedProductImage
                    src={product.image}
                    alt={product.title}
                    fill
                    colorHex={product.color?.[0]}
                    className="object-fit"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm sm:text-base leading-tight">{product.title}</p>
                  <p className="text-xs text-gray-400">Color: {product.color?.[0]}</p>
                  <p className="font-semibold text-sm md:hidden">${product.price}</p>
                </div>
              </div>

              <p className="hidden md:block font-semibold">${product.price}</p>
              <div className="hidden md:block">
                <ActionButton />
              </div>
            </div>
            <div className="mt-1 md:hidden">
              <ActionButton />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WishlistPage