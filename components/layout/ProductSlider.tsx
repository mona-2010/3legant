"use client"

import Image from "next/image"
import Link from "next/link"
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"
import { GoHeart } from "react-icons/go"
import ProductCard from "./ProductCard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Product {
  id: string
  title: string
  description?: string
  price: number
  original_price?: number
  image: string
  rating?: number
  is_new?: boolean
}

interface NewLabelProps {
  price: number
  originalPrice?: number
  isNew?: boolean
}

export const NewLabel = ({ price, originalPrice, isNew }: NewLabelProps) => {
  const hasDiscount = originalPrice && originalPrice > price
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between z-10 font-inter font-bold m-4">
      <div className="flex flex-col">
        {isNew && (
          <p className="px-2 text-sm text-black bg-white rounded-sm mb-2">
            NEW
          </p>
        )}

        {hasDiscount && (
          <p className="px-2 text-sm text-white bg-green-500 rounded-sm">
            -{discountPercentage}%
          </p>
        )}
      </div>

      <button>
        <GoHeart className="opacity-0 group-hover:opacity-100 text-4xl rounded-full bg-white p-2 transition-opacity" />
      </button>
    </div>
  )
}

type StarRatingProps = {
  rating: number
}

export const StarRating = ({ rating }: StarRatingProps) => {
  const stars = []

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-black-400" />)
    } else if (rating + 0.5 >= i) {
      stars.push(<FaStarHalfAlt key={i} className="text-black-400" />)
    } else {
      stars.push(<FaRegStar key={i} className="text-black-400" />)
    }
  }

  return <div className="flex gap-1">{stars}</div>
}

interface Props {
  products: Product[]
  grid: "1" | "2" | "3" | "4"
}

const ProductSlider = ({ products, grid }: Props) => {
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    const loadWishlist = async () => {

      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) return

      const { data: wishlist } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id)

      const map: Record<string, boolean> = {}

      wishlist?.forEach(item => {
        map[item.product_id] = true
      })

      setLikedProducts(map)
    }

    loadWishlist()
  }, [])

  const handleWishlist = async (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) {
      alert("Please login to add items to wishlist")
      return
    }

    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("id", existing.id)

      setLikedProducts(prev => ({
        ...prev,
        [productId]: false
      }))

    } else {

      await supabase.from("wishlist").insert({
        user_id: user.id,
        product_id: productId
      })

      setLikedProducts(prev => ({
        ...prev,
        [productId]: true
      }))
    }
  }

  return (
    <div
      className={`grid gap-8 ${grid === "4"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : grid === "3"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : grid === "2"
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1"
        }`}
    >
      {products.map((product) => {
        const {
          id,
          title,
          description,
          price,
          original_price,
          image,
          rating = 5,
          is_new = false,
        } = product

        const displayPrice = price
        const hasDiscount = original_price && original_price > price
        const discountPercentage = hasDiscount
          ? Math.round(((original_price! - price) / original_price!) * 100)
          : 0


        if (grid === "1") {
          return (
            <div key={id}>
              <Link
                href={`/product/${product.id}`}
                className="group bg-white py-4 block"
              >
                <div className="flex gap-8 p-6 group bg-white">
                  <div className="relative w-[220px] h-[220px] bg-gray-100">
                    <div className="absolute top-0 left-0 right-0 flex justify-between z-10 w-fit p-4 font-bold flex flex-col">
                      {is_new && (
                        <p className="px-2 text-sm text-black bg-white rounded-sm mb-2">
                          NEW
                        </p>
                      )}

                      {hasDiscount && (
                        <p className="px-2 text-sm text-white bg-green-500 rounded-sm">
                          -{discountPercentage}%
                        </p>
                      )}
                    </div>

                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-contain p-6"
                    />
                  </div>

                  <div className="flex flex-col justify-center flex-1">
                    <StarRating rating={rating} />
                    <p className="text-2xl font-semibold mt-2">{title}</p>

                    {description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {description}
                      </p>
                    )}

                    <div className="flex flex-col md:flex-row gap-2 font-bold mt-2">
                      <p className="text-black">${displayPrice.toFixed(2)}</p>

                      {hasDiscount && (
                        <p className="text-gray-200 line-through">
                          ${original_price?.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <button className="mt-4 px-6 py-2 bg-black text-white w-fit rounded-md">
                      Add to cart
                    </button>
                    <div className="flex justify-center w-25">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleWishlist(e, id)
                        }} className="flex items-center mt-2 py-2"
                      >
                        <GoHeart
                          className={`text-3xl bg-white p-2 rounded-full transition
                            ${likedProducts[id] ? "text-red-500" : "text-gray-500"}`}
                        /> Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        }

        if (grid === "2") {
          return (
            <div key={id}>
              <Link
                href={`/product/${product.id}`}
                className="group bg-white py-4 block"
              >
                <div className="flex flex-col md:flex-row gap-6 p-4 group bg-white">
                  <div className="relative w-full md:max-w-[265px] min-h-[250px] bg-gray-100">
                    <div className="absolute top-0 left-0 right-0 flex justify-between z-10 w-fit p-4 font-bold flex flex-col">
                      {is_new && (
                        <p className="px-2 text-sm text-black bg-white rounded-sm mb-2">
                          NEW
                        </p>
                      )}

                      {hasDiscount && (
                        <p className="px-2 text-sm text-white bg-green-500 rounded-sm">
                          -{discountPercentage}%
                        </p>
                      )}
                    </div>

                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <StarRating rating={rating} />

                    <p className="text-lg font-semibold mt-1">
                      {title}
                    </p>

                    {description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {description}
                      </p>
                    )}

                    <div className="flex flex-col md:flex-row gap-2 font-bold mt-2">
                      <p className="text-black">${displayPrice.toFixed(2)}</p>

                      {hasDiscount && (
                        <p className="text-gray-200 line-through">
                          ${original_price?.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <button className="mt-4 px-6 py-2 bg-black text-white w-fit rounded-md">
                      Add to cart
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleWishlist(e, id)
                      }} className="flex items-center mt-4 px-4 py-2"
                    >
                      <GoHeart
                        className={`text-3xl bg-white p-2 rounded-full transition
                        ${likedProducts[id] ? "text-red-500" : "text-gray-500"}`}
                      /> Wishlist
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          )
        }

        return (
          <div key={id} className="group bg-white p-4">
            <ProductCard product={product} />
          </div>
        )
      })}
    </div>
  )
}

export default ProductSlider