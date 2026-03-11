// "use client"
// import Image from "next/image"
// import Link from "next/link"
// import { GoHeart } from "react-icons/go"
// import { useState, useEffect } from "react"
// import { createClient } from "@/lib/supabase/client"
// import { NewLabel, StarRating } from "../layout/ProductSlider"

// export interface Product {
//   id: string
//   title: string
//   price: number
//   original_price?: number
//   image: string
//   rating?: number
//   category?: string[]
//   is_new?: boolean
// }

// interface Props {
//   product: Product
// }

// export default function ProductCard({ product }: Props) {
//   const supabase = createClient()
//   const {
//     id,
//     title,
//     price,
//     original_price,
//     image,
//     rating = 5,
//     is_new
//   } = product

//   const [liked, setLiked] = useState(false)
//   const [userId, setUserId] = useState<string | null>(null)
//   const hasDiscount = original_price && original_price > price

//   useEffect(() => {
//     const getUser = async () => {
//       const { data } = await supabase.auth.getSession()
//       const user = data.session?.user
//       if (user) setUserId(user.id)
//     }

//     getUser()
//   }, [])

//   useEffect(() => {
//     if (!userId) return
//     const checkWishlist = async () => {

//       const { data } = await supabase
//         .from("wishlist")
//         .select("id")
//         .eq("user_id", userId)
//         .eq("product_id", id)
//         .maybeSingle()
//       if (data) setLiked(true)
//     }
//     checkWishlist()
//   }, [id, userId])


//   const toggleWishlist = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     e.stopPropagation()

//     if (!userId) {
//       alert("Login to add items to wishlist")
//       return
//     }

//     if (liked) {
//       await supabase
//         .from("wishlist")
//         .delete()
//         .eq("user_id", userId)
//         .eq("product_id", id)

//       setLiked(false)

//     } else {

//       await supabase
//         .from("wishlist")
//         .insert({
//           user_id: userId,
//           product_id: id
//         })

//       setLiked(true)
//     }
//   }

//   return (
//     <Link
//       href={`/product/${product.id}`}
//       className="group bg-white py-4 block"
//     >

//       <div className="relative w-full h-[320px] bg-gray-100">
//         <NewLabel price={price} originalPrice={original_price} isNew={is_new} />

//         <button
//           onClick={toggleWishlist}
//           className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow"
//         >
//           <GoHeart
//             className={`text-2xl transition 
//             ${liked ? "text-red-500" : "text-gray-500"}`}
//           />
//         </button>

//         <Image
//           src={image}
//           alt={title}
//           fill
//           className="object-contain p-6"
//         />

//         <button
//           className="w-[85%] py-2 text-center rounded-xl absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white opacity-0 group-hover:opacity-100"
//         >
//           Add to cart
//         </button>

//       </div>

//       <div className="mt-4">
//         <StarRating rating={rating} />
//         <p className="text-lg font-semibold mt-1">{title}</p>
//         <div className="flex gap-3 font-bold mt-2">
//           <p>${price.toFixed(2)}</p>

//           {hasDiscount && (
//             <p className="text-gray-200 line-through">
//               ${original_price!.toFixed(2)}
//             </p>
//           )}
//         </div>
//       </div>

//     </Link>
//   )
// }

"use client"
import Image from "next/image"
import Link from "next/link"
import { GoHeart } from "react-icons/go"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDispatch } from "react-redux"
import { addToCart, setCart } from "@/store/cartSlice"
import { NewLabel, StarRating } from "../layout/ProductSlider"
import { AppDispatch } from "@/store/store"
import { fetchCart } from "@/lib/cart/fetchCart"

export interface Product {
  id: string
  title: string
  price: number
  original_price?: number
  image: string
  rating?: number
  category?: string[]
  is_new?: boolean
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const supabase = createClient()
  const dispatch = useDispatch<AppDispatch>()

  const {
    id,
    title,
    price,
    original_price,
    image,
    rating = 5,
    is_new
  } = product

  const [liked, setLiked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const hasDiscount = original_price && original_price > price

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (user) setUserId(user.id)
    }

    getUser()
  }, [])

  useEffect(() => {
    if (!userId) return
    const checkWishlist = async () => {

      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", id)
        .maybeSingle()
      if (data) setLiked(true)
    }
    checkWishlist()
  }, [id, userId])


  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      alert("Login to add items to wishlist")
      return
    }

    if (liked) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", id)

      setLiked(false)

    } else {

      await supabase
        .from("wishlist")
        .insert({
          user_id: userId,
          product_id: id
        })

      setLiked(true)
    }
  }

  const addProductToCart = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: existing } = await supabase
      .from("cart")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle()

    const newQty = existing ? existing.quantity + 1 : 1

    await supabase
      .from("cart")
      .upsert(
        {
          user_id: user.id,
          product_id: product.id,
          quantity: newQty
        },
        {
          onConflict: "user_id,product_id"
        }
      )

    const items = await fetchCart()
    dispatch(setCart(items))
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white py-4 block"
    >

      <div className="relative w-full h-[320px] bg-gray-100">
        <NewLabel price={price} originalPrice={original_price} isNew={is_new} />

        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow"
        >
          <GoHeart
            className={`text-2xl transition 
            ${liked ? "text-red-500" : "text-gray-500"}`}
          />
        </button>

        <Image
          src={image}
          alt={title}
          fill
          className="object-contain p-6"
        />

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

      </div>

      <div className="mt-4">
        <StarRating rating={rating} />
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