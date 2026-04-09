"use client"

import { toast } from "react-toastify"
import { Review } from "@/types"
import { FaArrowRight } from "react-icons/fa"

interface ReviewEntryProps {
    userId: string | null
    reviews: Review[]
    onStartEditingReview: (review: Review) => void
    onShowForm: () => void
}

export default function ReviewEntry({
    userId,
    reviews,
    onStartEditingReview,
    onShowForm,
}: ReviewEntryProps) {
    const requireAuth = () => {
        if (!userId) {
            toast.error("Please sign in to write a review")
            return false
        }
        return true
    }

    return (
        <div className="mt-8 flex w-full items-center border-2 border-gray-200 rounded-md font-inter font-medium text-black h-[65px]  max-sm:mx-auto max-sm:w-[90%]">
            <div className="flex items-center w-full">
                <input
                    type="text"
                    placeholder="Share your thoughts"
                    className="pl-5 w-full bg-transparent focus:outline-none"
                    onFocus={() => {
                        if (!requireAuth()) {
                            return
                        }
                        onShowForm()
                    }}
                    readOnly
                />
            </div>
            <button
                onClick={() => {
                    if (!requireAuth()) {
                        return
                    }
                    const existingReview = reviews.find((r) => r.user_id === userId)
                    if (existingReview) {
                        onStartEditingReview(existingReview)
                        return
                    }
                    onShowForm()
                }}
                className="cursor-pointer capitalize mr-2 md:mr-4 bg-black text-white md:w-[176px] rounded-full p-3 md:px-5 p md:py-2 flex items-center justify-center"
            >
                <span className="block md:hidden">
                    <FaArrowRight size={12}/>
                </span>
                <span className="hidden md:block">write review</span>
            </button>
        </div>
    )
}
