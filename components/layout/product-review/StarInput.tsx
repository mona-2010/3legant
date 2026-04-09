"use client"

import { useState } from "react"
import { FaStar } from "react-icons/fa"

interface StarInputProps {
    rating: number
    setRating: (r: number) => void
}

export default function StarInput({ rating, setRating }: StarInputProps) {
    const [hover, setHover] = useState(0)

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    className="cursor-pointer"
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                >
                    <FaStar
                        className={`text-lg ${
                            star <= (hover || rating) ? "text-black" : "text-gray-300"
                        }`}
                    />
                </button>
            ))}
        </div>
    )
}
