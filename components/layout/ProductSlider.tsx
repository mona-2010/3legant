"use client"

import { useRef } from "react"
import couch from "../../app/assets/images/couch.png"
import lamp from "../../app/assets/images/lamp.png"
import beigeLamp from "../../app/assets/images/lamp.png"
import bambooBasket from "../../app/assets/images/basket.png"
import toaster from "../../app/assets/images/couch.png"
import Image, { StaticImageData } from "next/image"
import Link from "next/link"
import { GoHeart } from "react-icons/go"
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"

export const productSlider = [
    { img: couch, title: "Loveseat Sofa", price: 199, category: "Living Room", stars: 4.5, discountPrice: 400 },
    { img: lamp, title: "Table Lamp", price: 24.99, category: "Bedroom", stars: 3 },
    { img: beigeLamp, title: "Beige Table Lamp", price: 24.99, category: "Bedroom", stars: 5 },
    { img: bambooBasket, title: "Bamboo basket", price: 24.99, category: "Outdoor", stars: 2.5 },
    { img: toaster, title: "Toaster", price: 224.99, category: "Kitchen", stars: 4 },
]


type StarRatingProps = {
    rating: number;
}

const StarRating = ({ rating }: StarRatingProps) => {
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

export const NewLabel = () => {
    return (
        <div className="flex justify-between z-10 font-inter font-bold m-4">
            <div className="flex flex-col">
                <p className="px-2 text-sm text-black bg-white rounded-sm mb-2">NEW</p>
                <p className="px-2 text-sm text-white bg-green-400 rounded-sm">-50%</p>
            </div>
            <Link href="/cart"><GoHeart className="opacity-0 group-hover:opacity-100 text-4xl rounded-full bg-white p-2" /></Link>
        </div>
    );
};

type SlideProps = {
    img: StaticImageData
    title: string
    price: number
    discountPrice?: number
    stars: number
    grid?: string
}

export const Product = ({
    img,
    title,
    price,
    discountPrice,
    stars,
    grid = "3",
}: SlideProps) => {

    if (grid === "1") {
        return (
            <div className="flex gap-8 p-6 group bg-white">
                <div className="relative w-[220px] bg-[#F3F5F7]">
                    <NewLabel />
                    <Image src={img} alt={title} className="h-48 m-auto" />
                </div>

                <div className="flex flex-col justify-center flex-1">
                    <StarRating rating={stars} />
                    <p className="text-2xl font-semibold mt-2">{title}</p>

                    <div className="flex font-bold mt-2">
                        <p className="mr-3">${price.toFixed(2)}</p>
                        {discountPrice && (
                            <p className="text-[#6C7275] line-through">
                                ${discountPrice.toFixed(2)}
                            </p>
                        )}
                    </div>

                    <Link
                        href="/cart"
                        className="mt-4 px-6 py-2 bg-black text-white w-fit rounded-md"
                    >
                        Add to cart
                    </Link>
                </div>
            </div>
        )
    }

    if (grid === "2") {
        return (
            <div className="flex gap-6 p-4 group bg-white">
                <div className="relative w-[160px] bg-[#F3F5F7]">
                    <NewLabel />
                    <Image src={img} alt={title} className="h-40 m-auto" />
                </div>

                <div className="flex flex-col justify-center">
                    <StarRating rating={stars} />
                    <p className="text-lg font-semibold mt-1">{title}</p>

                    <div className="flex font-bold mt-2">
                        <p className="mr-3">${price.toFixed(2)}</p>
                        {discountPrice && (
                            <p className="text-[#6C7275] line-through">
                                ${discountPrice.toFixed(2)}
                            </p>
                        )}
                    </div>

                    <Link
                        href="/cart"
                        className="mt-3 px-4 py-2 bg-black text-white w-fit rounded-md"
                    >
                        Add to cart
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col justify-start items-start mr-6 mb-12 group">
            <div className="relative w-full bg-[#F3F5F7]">
                <NewLabel />
                <Image src={img} alt={title} className="flex h-48 m-auto mb-12 lg:h-56" />
                <Link
                    href="/cart"
                    className="w-[92%] py-2 text-center rounded-xl absolute bottom-3 left-3 bg-black text-white opacity-0 group-hover:opacity-100"
                >
                    Add to cart
                </Link>
            </div>

            <div className="flex flex-col mt-4 font-inter text-black w-full">
                <StarRating rating={stars} />
                <p className="font-regular text-xl leading-8">{title}</p>

                <div className="flex font-bold">
                    <p className="text-sm mr-3">${price.toFixed(2)}</p>
                    {discountPrice && (
                        <p className="text-sm text-[#6C7275] line-through">
                            ${discountPrice.toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

const SlideItems = () => {
    const sliderRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (!sliderRef.current) return
        const { current } = sliderRef
        const scrollAmount = 320

        current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        })
    }

    return (
        <section className="relative mt-8 mb-8 ml-[30px] md:ml-[140px]">
            <div
                ref={sliderRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar"
            >
                {productSlider.map((item, index) => (
                    <div key={index} className="snap-start shrink-0">
                        <Product
                            img={item.img}
                            title={item.title}
                            price={item.price}
                            discountPrice={item.discountPrice}
                            stars={item.stars}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default SlideItems