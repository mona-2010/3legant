"use client"
import { useState, useMemo, useEffect } from "react"
import Breadcrumb from "../BreadCrumb"
import { Header, NavigationHeader } from "../dynamicComponents"
import shopbg from "@/app/assets/images/shopbg.png"
import FilterBar, { categories, prices } from "../layout/FilterBar"
import Newsletter from "../layout/NewsLetter"
import Footer from "../layout/Footer"
import ShopTopBar from "@/components/layout/SortBar"
import ProductSlider from "@/components/layout/ProductSlider"
import { createClient } from "@/lib/supabase/client"

interface ProductType {
  id: string
  title: string
  description?: string
  price: number
  original_price?: number
  image: string
  rating?: number
  category?: string[]
  is_new?: boolean
  created_at: string
}

const ShopPage = () => {
  const [grid, setGrid] = useState("3")
  const [sort, setSort] = useState("default")
  const [visibleCount, setVisibleCount] = useState(6)
  const [selectedCategory, setSelectedCategory] = useState("All Rooms")
  const [selectedPrices, setSelectedPrices] = useState<string[]>(["all"])
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    setVisibleCount(6)
  }, [selectedCategory, selectedPrices, sort])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (selectedCategory !== "All Rooms") {
      filtered = filtered.filter(
        (p) => Array.isArray(p.category) ? p.category.includes(selectedCategory) : p.category === selectedCategory
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
        className="mx-[30px] md:mx-[140px] flex justify-center items-center"
        style={{
          backgroundImage: `url(${shopbg.src})`,
          backgroundSize: "cover",
          minHeight: "392px",
        }}
      >
        <div className="flex flex-col items-center">
          <Breadcrumb currentPage="Shop" />
          <h1 className="my-5 font-poppins text-[54px] font-[500]">
            Shop Bag
          </h1>
          <p className="text-[20px] text-[#121212]">
            Let’s design the place you always imagined.
          </p>
        </div>
      </div>

      <div className="mx-[30px] md:mx-[140px] mt-16 flex flex-col lg:flex-row gap-12">

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
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border px-2 py-2 rounded-md w-[262px]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
                  className="border px-2 py-2 rounded-md w-[262px]"
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
              <p>Loading...</p>
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
                onClick={() => setVisibleCount(filteredProducts.length)}
                className="px-12 py-3 border border-black rounded-full hover:bg-black hover:text-white transition"
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