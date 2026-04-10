"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RxCross1 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { upsertCartItem } from "@/store/cartSlice"
import { AppDispatch, RootState } from "@/store/store"
import { addItemToCart } from "@/lib/cart/mutations"
import { toast } from "react-toastify"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import TintedProductImage from "../layout/TintedProductImage"
import WishlistSkeleton from "../common/WishlistSkeleton"
import { removeFromWishlist, setWishlistProductIds } from "@/store/wishlistSlice"
import { getEffectiveProductPrice } from "@/lib/utils/product-pricing"

interface WishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    title: string
    price: number
    original_price?: number
    valid_until?: string | null
    image: string
    color?: string[]
    is_active?: boolean
    stock?: number
  }
}

const PAGE_SIZE = 6

const WishlistPage = () => {
  const router = useRouter()
  const supabase = createClient()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const colorPreferences = useSelector((state: RootState) => state.wishlist.colorPreferences)

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [addingProductId, setAddingProductId] = useState<string | null>(null)

  const normalizeWishlistItems = (rawItems: WishlistItem[]) => {
    return rawItems.map((item) => {
      if (!item.products) return item

      return {
        ...item,
        products: {
          ...item.products,
          price: getEffectiveProductPrice({
            price: item.products.price,
            original_price: item.products.original_price,
            valid_until: item.products.valid_until,
          }),
        },
      }
    })
  }

  const fetchWishlistPage = async (offset: number, append: boolean) => {
    if (!user) {
      setItems([])
      setLoading(false)
      setLoadingMore(false)
      setHasMore(false)
      return
    }

    if (append) setLoadingMore(true)
    else setLoading(true)

    const { data, count, error } = await supabase
      .from("wishlist")
      .select(`
        id,
        product_id,
        products!wishlist_product_fk (
          id,
          title,
          price,
          original_price,
          valid_until,
          image,
          color,
          is_active,
          stock
        )
      `, { count: "exact" })
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
    } else {
      const nextItems = normalizeWishlistItems((data as WishlistItem[]) || [])
      setItems((prev) => (append ? [...prev, ...nextItems] : nextItems))

      const nextLoadedIds = append
        ? [...items.map((item) => item.product_id), ...nextItems.map((item) => item.product_id)]
        : nextItems.map((item) => item.product_id)

      dispatch(setWishlistProductIds(Array.from(new Set(nextLoadedIds))))

      const totalCount = count ?? 0
      setHasMore(offset + nextItems.length < totalCount)
    }

    if (append) setLoadingMore(false)
    else setLoading(false)
  }

  useEffect(() => {
    if (!user) {
      setItems([])
      setLoading(false)
      setLoadingMore(false)
      setHasMore(false)
      dispatch(setWishlistProductIds([]))
      return
    }

    setItems([])
    setHasMore(false)
    void fetchWishlistPage(0, false)
  }, [user?.id])

  const removeItem = async (wishlistId: string, productId: string) => {
    if (!user) return
    await dispatch(removeFromWishlist({ userId: user.id, productId }))
    setItems((prev) => prev.filter((item) => item.id !== wishlistId))
    dispatch(setWishlistProductIds(items.filter((item) => item.id !== wishlistId).map((item) => item.product_id)))
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
                if (!user) { router.push("/sign-in"); return }
                if (addingProductId === product.id) return
                if (isStockLimitReached) { toast.error("Stock limit exceeded"); return }

                const selectedColor = colorPreferences[product.id] ?? product.color?.[0] ?? null
                setAddingProductId(product.id)
                try {
                  const result = await addItemToCart({
                    userId: user.id,
                    productId: product.id,
                    quantity: 1,
                    color: selectedColor,
                  })

                  if (!result.success || !result.item) { toast.error("Stock limit exceeded"); return }

                  dispatch(upsertCartItem({
                    id: result.item.id,
                    product_id: result.item.product_id,
                    name: product.title,
                    image: product.image,
                    price: product.price,
                    quantity: result.item.quantity,
                    color: result.item.color ?? undefined,
                    stock: product.stock,
                  }))
                  toast.success(`${product.title} added to cart`)
                } finally {
                  setAddingProductId(null)
                }
              }}
              disabled={addingProductId === product.id}
              className="cursor-pointer bg-black text-white px-4 py-2 rounded-md text-sm w-full md:w-fit disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {addingProductId === product.id ? "Adding..." : "Add to cart"}
            </button>
          )
        }

        return (
          <div key={item.id} className="border-b border-lightgray py-6">
            <div
              className="grid sm:grid-cols-[3fr_1fr] md:grid-cols-[3fr_1fr_1fr] items-center"
            >
              <div className="flex items-center gap-3 w-full bg-white">
                <button
                  onClick={() => removeItem(item.id, item.product_id)}
                  className="cursor-pointer text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <RxCross1 />
                </button>

                <div className="relative w-12 h-16 flex-shrink-0">
                  <TintedProductImage
                    src={product.image}
                    alt={product.title}
                    fill
                    colorHex={colorPreferences[product.id] ?? product.color?.[0]}
                    className="object-fit mix-blend-multiply"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm sm:text-base leading-tight">{product.title}</p>
                  <p className="text-xs text-gray-400">Color: {colorPreferences[product.id] ?? product.color?.[0]}</p>
                  <p className="font-semibold text-sm md:hidden">${product.price}</p>
                </div>
              </div>

              <p className="hidden md:block font-semibold">${product.price}</p>
              <div className="hidden md:block">
                <ActionButton />
              </div>
            </div>
            <div className="mt-5 md:hidden">
              <ActionButton />
            </div>
          </div>
        )
      })}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => void fetchWishlistPage(items.length, true)}
            disabled={loadingMore}
            className="cursor-pointer px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? "Loading..." : "Show More"}
          </button>
        </div>
      )}
    </div>
  )
}

export default WishlistPage