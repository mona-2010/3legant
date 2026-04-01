"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import ButtonText from "./ButtonText"
import ProductCard from "./ProductCard"
import ProductCardSkeleton from "../common/ProductCardSkeleton"
import { useProducts, ProductType } from "@/lib/hooks/useProducts"

const ProductCarousel = () => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const { products: allProducts, loading } = useProducts()

  const products = useMemo(() => {
    return allProducts
      .filter((p) => p.is_new && p.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 24)
  }, [allProducts])
  
  if (!loading && products.length === 0) return null


  return (
    <>
      <section className="flex justify-between mt-8 mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex-col md:flex-row font-poppins">
        <p className="text-[35px] font-medium">
          New Arrivals
        </p>

        <div className="flex self-end">
          <ButtonText text="More Products" linkTo="shop" />
        </div>
      </section>

      <section className="mt-8 mb-12 ml-[30px] md:ml-[50px] lg:ml-[80px] xl:ml-[140px]">
        {loading ? (
          <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[280px]">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory"
          >
            {products
              .map((product) => (
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