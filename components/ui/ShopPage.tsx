"use client"

import { useState, useMemo } from "react"
import Breadcrumb from '../BreadCrumb'
import { Header, NavigationHeader } from '../dynamicComponents'
import shopbg from "@/app/assets/images/shopbg.png"
import FilterBar, { categories, prices } from '../layout/FilterBar'
import Newsletter from '../layout/NewsLetter'
import Footer from '../layout/Footer'
import ShopTopBar from '@/components/layout/SortBar'
import { Product, productSlider } from '@/components/layout/ProductSlider'

const ShopPage = () => {
  const [grid, setGrid] = useState("3")
  const [sort, setSort] = useState("default")
  const [selectedCategory, setSelectedCategory] = useState("All Rooms")
  const [selectedPrice, setSelectedPrice] = useState("all")

  const filteredProducts = useMemo(() => {
    let products = [...productSlider]

    if (selectedCategory !== "All Rooms") {
      products = products.filter((p) => p.category === selectedCategory)
    }

    if (selectedPrice !== "all") {
      products = products.filter((p) => {
        const price = p.price
        if (selectedPrice === "0-99") return price <= 99
        if (selectedPrice === "100-199") return price >= 100 && price <= 199
        if (selectedPrice === "200-299") return price >= 200 && price <= 299
        if (selectedPrice === "300-399") return price >= 300 && price <= 399
        if (selectedPrice === "400+") return price >= 400
        return true
      })
    }

    if (sort === "low") products.sort((a, b) => a.price - b.price)
    if (sort === "high") products.sort((a, b) => b.price - a.price)
    if (sort === "newest") products.reverse()

    return products
  }, [selectedCategory, selectedPrice, sort])

  return (
    <div>
      <NavigationHeader />
      <Header />
      <div
        className='mx-[30px] md:mx-[140px] flex justify-center items-center'
        style={{
          backgroundImage: `url(${shopbg.src})`,
          backgroundSize: 'cover',
          minHeight: '392px'
        }}
      >
        <div className='flex flex-col items-center'>
          <Breadcrumb currentPage='Shop' />
          <h1 className='my-5 font-poppins text-[54px] font-[500]'>
            Shop Bag
          </h1>
          <p className='text-[20px] text-[#121212]'>
            Let’s design the place you always imagined.
          </p>
        </div>
      </div>

      <div className='mx-[30px] md:mx-[140px] mt-16 flex flex-col lg:flex-row gap-12'>
        {grid === "3" && (
          <div className='lg:w-[262px] w-full'>
            <FilterBar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
          </div>
        )}

        <div className='flex-1'>
          {grid !== "3" && (
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div>
                <label className="block text-[#6C7275] font-semibold mb-2 uppercase">
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
                <label className="block text-[#6C7275] font-semibold mb-2 uppercase">
                  Price
                </label>

                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
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
          <div
            className={`grid ${grid === "4"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : grid === "3"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : grid === "2"
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1"
              } gap-8`}
          >
            {filteredProducts.map((item, index) => (
              <Product
                key={index}
                img={item.img}
                title={item.title}
                price={item.price}
                discountPrice={item.discountPrice}
                stars={item.stars}
                grid={grid}
              />
            ))}
          </div>
        </div>
      </div>

      <Newsletter />
      <Footer />
    </div>
  )
}

export default ShopPage