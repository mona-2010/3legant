"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import ButtonText from "./ButtonText"
import { createClient } from "@/lib/supabase/client"
import { NewLabel, StarRating } from "./ProductSlider"
import Link from "next/link"
import ProductCard from "./ProductCard"

export interface ProductType {
  id: string
  title: string
  price: number
  original_price?: number
  image: string
  category: string[]
  created_at: string
  rating: number
  color?: string
  is_new?: boolean
}

const ProductCarousel = () => {
  const supabase = createClient()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8)

      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  

  return (
    <>
      <section className="flex justify-between mt-8 mx-[32px] md:mx-[140px] flex-col md:flex-row font-poppins">
        <p className="text-[35px] font-medium">
          New Arrivals
        </p>

        <div className="flex self-end">
          <ButtonText text="More Products" linkTo="shop" />
        </div>
      </section>

      <section className="mt-8 mb-12 ml-[30px] md:ml-[140px]">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory"
          >
            {products.map((product) => (
              <div key={product.id} className="snap-start shrink-0 w-[280px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default ProductCarousel