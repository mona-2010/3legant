"use client"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Breadcrumb from "../BreadCrumb"
import { Header, NavigationHeader } from "../dynamicComponents"
import shopbg from "@/app/assets/images/shopbg.png"
import FilterBar, { categoryFilters, CategoryFilter, getCategoryLabel, prices } from "../layout/FilterBar"
import Newsletter from "../layout/NewsLetter"
import Footer from "../layout/Footer"
import ShopTopBar from "@/components/layout/SortBar"
import ProductSlider from "@/components/layout/ProductSlider"
import { useProducts, ProductType } from "@/lib/hooks/useProducts"
import ShopPageSkeleton from "../common/ShopPageSkeleton"
import { isProductCategory, ProductCategory } from "@/types"

const normalizeCategoryParam = (value: string | null): CategoryFilter => {
  if (!value) return "all"

  if (value === "All Rooms") return "all"
  if (isProductCategory(value)) return value

  const slug = value.trim().toLowerCase().replace(/\s+/g, "_")
  if (isProductCategory(slug)) return slug
  return "all"
}

const ShopPage = () => {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const [grid, setGrid] = useState("3")
  const [sort, setSort] = useState("default")
  const [visibleCount, setVisibleCount] = useState(6)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(normalizeCategoryParam(categoryParam))
  const [selectedPrices, setSelectedPrices] = useState<string[]>(["all"])
  const { products, loading } = useProducts()

  useEffect(() => {
    if (window.innerWidth < 768) {
      setGrid("2")
    }
  }, [])

  useEffect(() => {
    setSelectedCategory(normalizeCategoryParam(categoryParam))
  }, [categoryParam])

  useEffect(() => {
    setVisibleCount(6)
  }, [selectedCategory, selectedPrices, sort])

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.is_active)

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => Array.isArray(p.category) && p.category.includes(selectedCategory)
      )
    }

    if (!selectedPrices.includes("all")) {
      filtered = filtered.filter((p) =>
        selectedPrices.some((range) => {
          const price = p.price
          if (range === "0-99") return price <= 99
          if (range === "100-199") return price >= 100 && price <= 199
          if (range === "200-299") return price >= 200 && price <= 299
          if (range === "300-399") return price >= 300 && price <= 399
          if (range === "400+") return price >= 400
          return false
        })
      )
    }

    if (sort === "low") filtered.sort((a, b) => a.price - b.price)
    if (sort === "high") filtered.sort((a, b) => b.price - a.price)
    if (sort === "newest")
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )

    return filtered
  }, [products, selectedCategory, selectedPrices, sort])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  return (
    <div>
      <NavigationHeader />
      <Header />
      <div
        className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex justify-center items-center bg-cover min-h-[200px] lg:min-h-[400px] max-h-[392px]"
        style={{
          backgroundImage: `url(${shopbg.src})`
        }}
      >
        <div className="flex flex-col w-full justify-center mx-auto items-center">
          <Breadcrumb currentPage="Shop" />
          <h1 className="my-5 font-poppins text-[24px] md:text-[36px] lg:text-[54px] font-[500]">
            Shop Page
          </h1>
          <p className="text-center text-[12px] md:text-[16px] lg:text-[20px] text-[#121212]">
            Let’s design the place you always imagined.
          </p>
        </div>
      </div>

      <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] mt-8 md:mt-12 lg:mt-16 flex flex-col lg:flex-row gap-12">

        {grid === "3" && (
          <div className="lg:w-[262px] w-full">
            <FilterBar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPrices={selectedPrices}
              setSelectedPrices={setSelectedPrices}
            />
          </div>
        )}

        <div className="flex-1">
          {grid !== "3" && (
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div>
                <label className="block text-gray-200 font-semibold mb-2 uppercase">
                  Categories
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(normalizeCategoryParam(e.target.value))}
                  className="border px-2 py-2 rounded-md w-full md:w-[260px] lg:w-[262px]"
                >
                  {categoryFilters.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-200 font-semibold mb-2 uppercase">
                  Price
                </label>

                <select
                  value={selectedPrices[0] || "all"}
                  onChange={(e) => setSelectedPrices([e.target.value])}
                  className="border px-2 py-2 rounded-md w-full md:w-[260px] lg:w-[262px]"
                >
                  {prices.map((price) => (
                    <option key={price} value={price}>
                      {price === "all"
                        ? "All Price"
                        : price === "400+"
                          ? "$400+"
                          : `$${price.replace("-", " - $")}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <ShopTopBar
            grid={grid}
            setGrid={setGrid}
            setSort={setSort}
            selectedCategory={selectedCategory}
          />

          <div>
            {loading ? (
              <ShopPageSkeleton />
            ) : (
              <ProductSlider
                products={visibleProducts}
                grid={grid as "1" | "2" | "3" | "4"}
              />
            )}
          </div>
          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredProducts.length))}
                className="px-4 md:px-6 lg:px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition"
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
      <Newsletter />
      <Footer />
    </div>
  )
}

export default ShopPage