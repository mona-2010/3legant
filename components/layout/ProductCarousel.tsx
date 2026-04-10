import { getProducts } from "@/lib/actions/products"
import { isProductNew } from "@/lib/utils/product-utils"
import ButtonText from "./ButtonText"
import ProductCard from "./ProductCard"

const ProductCarousel = async () => {
  const { data } = await getProducts({
    isActive: true,
    sort: "newest",
    limit: 24,
  })

  const products = (data || []).filter((product) => isProductNew(product.created_at))

  if (products.length === 0) return null

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between my-10 mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex-col md:flex-row font-poppins">
        <p className="text-[35px] font-medium">
          New Arrivals
        </p>

        <div className="flex">
          <ButtonText text="More Products" linkTo="shop" />
        </div>
      </section>

      <section className="my-10 ml-[30px] md:ml-[50px] lg:ml-[80px] xl:ml-[140px]">
        <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory">
          {products.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default ProductCarousel