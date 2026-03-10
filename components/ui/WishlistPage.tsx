"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { FaTrash } from "react-icons/fa"
import { RxCross1 } from "react-icons/rx"

interface WishlistItem {
  id: string
  product_id: string
  products: {
    id: string
    title: string
    price: number
    original_price?: number
    image: string
  }
}

const WishlistPage = () => {

  const supabase = createClient()

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
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
      image
    )
  `)
      .eq("user_id", user.id)

    if (error) {
      console.error(error)
    } else {
      setItems(data as unknown as WishlistItem[])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const removeItem = async (wishlistId: string) => {

    await supabase
      .from("wishlist")
      .delete()
      .eq("id", wishlistId)

    setItems((prev) => prev.filter((item) => item.id !== wishlistId))
  }

  if (loading) return <p>Loading wishlist...</p>

  if (items.length === 0)
    return <p className="text-gray-500">Your wishlist is empty.</p>

  return (
    <div className="w-full mb-10">

      <h2 className="text-2xl font-semibold mb-6">Your Wishlist</h2>

      <div className="grid grid-cols-[3fr_1fr_1fr] pl-5 md:pl-10 text-gray-500 border-b border-lightgray pb-3 mb-6">
        <p>Product</p>
        <p>Price</p>
        <p>Action</p>
      </div>

      {items.map((item) => {

        const product = item.products
        if (!product) return null

        return (
          <div
            key={item.id}
            className="grid grid-cols-[3fr_1fr_1fr] items-center border-b border-lightgray py-6"
          >
            <div className="flex items-center gap-4">

              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <RxCross1 />
              </button>

              <div className="relative w-20 h-20">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>

              <div>
                <p className="font-medium">{product.title}</p>
              </div>

            </div>

            <p className="font-semibold">
              ${product.price}
            </p>

            <button className="bg-black text-white px-4 py-2 rounded-md w-fit">
              Add to cart
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default WishlistPage