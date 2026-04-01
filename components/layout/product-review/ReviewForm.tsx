"use client"

import StarInput from "./StarInput"

interface ReviewFormProps {
    reviewRating: number
    setReviewRating: (value: number) => void
    reviewText: string
    setReviewText: (value: string) => void
    submitting: boolean
    editingReviewId: string | null
    onSubmit: () => void
    onCancel: () => void
}

export default function ReviewForm({
    reviewRating,
    setReviewRating,
    reviewText,
    setReviewText,
    submitting,
    editingReviewId,
    onSubmit,
    onCancel,
}: ReviewFormProps) {
    return (
        <div className="mt-8 border-2 border-gray-200 rounded-md p-5 max-lg:w-[400px] max-sm:mx-auto max-sm:w-[90%]">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium">Your Rating:</span>
                <StarInput rating={reviewRating} setRating={setReviewRating} />
            </div>
            <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:border-black min-h-[100px] resize-none"
            />
            <div className="flex gap-3 mt-3">
                <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="bg-black text-white rounded-full px-6 py-2 text-sm disabled:opacity-50"
                >
                    {submitting
                        ? editingReviewId
                            ? "Updating..."
                            : "Submitting..."
                        : editingReviewId
                        ? "Update Review"
                        : "Submit Review"}
                </button>
                <button
                    onClick={onCancel}
                    className="border border-gray-300 rounded-full px-6 py-2 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
