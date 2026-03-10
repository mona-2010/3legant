"use client"
import Image, { StaticImageData } from "next/image"
import { useState } from "react"
import { StarRating } from "./ProductSlider"
import avatar from '@/app/assets/images/avatar.png'
import FAQAccordion, { FAQItem } from "@/components/layout/FaqAccordion";

type Review = {
    id: number
    name: string
    avatar: StaticImageData
    rating: number
    text: string
    date: string
}
export const furnitureFAQs: FAQItem[] = [
    {
        question: "What materials are used in your furniture?",
        answer:
            "Our furniture is made from high-quality solid wood, engineered wood, metal, and premium fabrics to ensure durability and style.",
    },
    {
        question: "Do you offer customization options?",
        answer:
            "Yes, selected furniture pieces can be customized in size, fabric, color, and finish to match your interior design.",
    },
    {
        question: "How long does delivery take?",
        answer:
            "Delivery usually takes between 5–10 business days depending on your location and product availability.",
    },
    {
        question: "Do you provide furniture installation?",
        answer:
            "Yes, we provide professional installation services for certain furniture items to ensure proper setup.",
    },
    {
        question: "What is your return policy?",
        answer:
            "We offer a 7-day return or replacement policy for damaged or defective products.",
    },
];

const reviews: Review[] = [
    {
        id: 1,
        name: "Sofia Harvetz",
        avatar: avatar,
        rating: 1,
        date: "2 weeks ago",
        text: "I bought it 3 weeks ago and now come back just to say 'Awesome Product'. I really enjoy it.",
    },
    {
        id: 2,
        name: "Nicolas Jensen",
        avatar: avatar,
        rating: 3,
        date: "3 weeks ago",
        text: "I bought it 3 weeks ago and now come back just to say 'Awesome Product'. I really enjoy it.",
    },
    {
        id: 3,
        name: "Dwight Howard",
        avatar: avatar,
        rating: 5,
        date: "4 weeks ago",
        text: "I bought it 3 weeks ago and now come back just to say 'Awesome Product'. I really enjoy it.",
    },

    {
        id: 4,
        name: "Jimmy Butler",
        avatar: avatar,
        rating: 2,
        date: "5 weeks ago",
        text: "I bought it 3 weeks ago and now come back just to say 'Awesome Product'. I really enjoy it.",
    },
    {
        id: 5,
        name: "Pam Halpert",
        avatar: avatar,
        rating: 4,
        date: "1 weeks ago",
        text: "I bought it 3 weeks ago and now come back just to say 'Awesome Product'. I really enjoy it.",
    },
]


const ProductReviews = () => {
    const [activeTab, setActiveTab] = useState("reviews")
    const [sortBy, setSortBy] = useState("newest")
    const [visibleCount, setVisibleCount] = useState(2)
    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        }

        if (sortBy === "oldest") {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        }

        if (sortBy === "highest") {
            return b.rating - a.rating
        }

        if (sortBy === "lowest") {
            return a.rating - b.rating
        }

        return 0
    })

    const visibleReview = sortedReviews.slice(0, visibleCount)
    return (
        <div className="mt-20">
            <div className="flex gap-8 border-b border-lightgray pb-4 text-gray-500 text-sm font-medium">
                <button
                    onClick={() => setActiveTab("info")}
                    className={activeTab === "info" ? "text-black border-b-2 border-transparent border-black" : ""}
                >
                    Additional Info
                </button>

                <button
                    onClick={() => setActiveTab("questions")}
                    className={activeTab === "questions" ? "text-black border-b-2 border-transparent border-black" : ""}
                >
                    Questions
                </button>

                <button
                    onClick={() => setActiveTab("reviews")}
                    className={activeTab === "reviews" ? "text-black border-b-2 border-transparent border-black " : ""}
                >
                    Reviews
                </button>
            </div>
            {activeTab === "info" && (
                <div className="mt-10">
                    <h2 className="font-poppins text-2xl font-[500]">Additional Information</h2>
                    <h3 className="font-[600] text-gray-200">Details</h3>
                    <p>You can use the removable tray for serving. The design makes it easy to put the tray back after use since you place it directly on the table frame without having to fit it into any holes.</p>
                    <h3 className="font-[600] text-gray-200">Packaging</h3>
                    <p>Width: 20 " Height: 1 ½ " Length: 21 ½ "
                        Weight: 7 lb 8 oz
                        Package(s): 1
                    </p>
                </div>
            )
            }

            {activeTab === "questions" && (
                <div className="mt-10">
                    <h2 className="font-poppins text-2xl font-[500]">Questions</h2>
                    <FAQAccordion faqs={furnitureFAQs} />
                </div>
            )
            }
            {activeTab === "reviews" && (
                <div className="mt-10">
                    <h2 className="font-poppins text-2xl font-[500]">Customer Reviews</h2>
                    <div className="flex items-center gap-3 mt-3">
                        <StarRating rating={4.5} />
                        <p className="text-gray-600 text-sm">11 Reviews</p>
                    </div>

                    <p className="mt-2">Tray Table</p>
                    <div className="mt-8 flex w-full items-center border-2 border-gray-200 rounded-md font-inter font-medium text-black h-[65px] max-lg:w-[400px] max-sm:mx-auto max-sm:w-[90%]"
                    >
                        <div className="flex items-center w-full">
                            <input
                                type="text"
                                name="text"
                                placeholder="Share your thoughts"
                                className="pl-5 w-full bg-transparent focus:outline-none"
                            />
                        </div>

                        <button className="capitalize mr-2 md:mr-4 bg-black text-white w-[150px] md:w-[176px] rounded-full px-5 py-1 md:py-2">
                            write review
                        </button>
                    </div>

                    <div className="flex justify-between items-center mt-10">
                        <h3 className="font-poppins text-[28px] font-[500]">11 Reviews</h3>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-lightgray px-2 py-2 rounded-md text-sm"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                    </div>

                    <div className="mt-10 space-y-10">
                        {visibleReview.map((review) => (
                            <div key={review.id} className="flex gap-4 border-b border-lightgray pb-8">
                                <Image
                                    src={review.avatar}
                                    alt={review.name}
                                    className=" w-15 h-15 rounded-full"
                                />

                                <div className="flex-1">
                                    <h4 className="font-semibold">{review.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <StarRating rating={review.rating} />
                                    </div>

                                    <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                                        {review.text}
                                    </p>

                                    <div className="flex gap-6 text-sm text-gray-500 mt-4">
                                        <button>Like</button>
                                        <button>Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {visibleCount < reviews.length && (
                        <div className="flex justify-center mt-10">
                            <button onClick={() =>
                                setVisibleCount(reviews.length)}
                                className="border px-8 py-3 rounded-full hover:bg-black hover:text-white transition">
                                Load more
                            </button>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    )
}

export default ProductReviews