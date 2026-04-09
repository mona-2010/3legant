"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Breadcrumb from "../BreadCrumb"
import { Header, NavigationHeader } from "../dynamicComponents"
import shopbg from "@/app/assets/images/shopbg.png"
import FilterBar, { categoryFilters, CategoryFilter, getCategoryLabel, prices } from "../layout/FilterBar"
import Newsletter from "../layout/NewsLetter"
import Footer from "../layout/Footer"
import ShopTopBar from "@/components/layout/SortBar"
import ProductSlider from "@/components/layout/ProductSlider"
import { usePaginatedProducts } from "@/lib/hooks/useProducts"
import ShopPageSkeleton from "../common/ShopPageSkeleton"
import { isProductCategory } from "@/types"

const ALL_PRICE_SELECTION = ["all", ...prices.filter((price) => price !== "all")]

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(normalizeCategoryParam(categoryParam))
  const [selectedPrices, setSelectedPrices] = useState<string[]>(ALL_PRICE_SELECTION)
  const shouldFetchProducts = selectedPrices.length > 0
  const { products, loading, loadingMore, hasMore, fetchMore } = usePaginatedProducts({
    category: selectedCategory,
    selectedPrices,
    sort: sort as "default" | "newest" | "low" | "high",
    pageSize: 6,
    enabled: shouldFetchProducts,
  })

  useEffect(() => {
    if (window.innerWidth < 768) {
      setGrid("2")
    }
  }, [])

  useEffect(() => {
    setSelectedCategory(normalizeCategoryParam(categoryParam))
  }, [categoryParam])

  const hasNoResults = !loading && products.length === 0

  return (
    <div>
      <NavigationHeader />
      <Header />
      <div className="page-content-container">
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

        <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] my-8 md:my-12 lg:my-16 flex flex-col lg:flex-row gap-12">

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
                  className="cursor-pointer border px-2 py-2 rounded-md w-full md:w-[260px] lg:w-[262px]"
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
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    setSelectedPrices(selectedValue === "all" ? ALL_PRICE_SELECTION : [selectedValue])
                  }}
                  className="cursor-pointer border px-2 py-2 rounded-md w-full md:w-[260px] lg:w-[262px]"
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
            ) : hasNoResults ? (
              <div className="py-16 text-center text-gray-600">No products found.</div>
            ) : (
              <ProductSlider
                products={products}
                grid={grid as "1" | "2" | "3" | "4"}
              />
            )}
          </div>
          {hasMore && !hasNoResults && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => void fetchMore()}
                disabled={loadingMore}
                className="cursor-pointer px-6 md:px-6 lg:px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Show More"}
              </button>
            </div>
          )}
        </div>
        </div>
        <Newsletter />
      </div>
      <Footer />
    </div>
  )
}

export default ShopPage