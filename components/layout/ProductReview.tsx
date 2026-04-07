"use client"
import { useState, useEffect, useCallback } from "react"
import { StarRating } from "./ProductSlider"
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewLike,
    createReviewReply,
    deleteReviewReply,
    canUserReviewProduct,
} from "@/lib/actions/reviews"
import { Review } from "@/types"
import { toast } from "react-toastify"
import AdditionalInfoTab from "./product-review/AdditionalInfoTab"
import QuestionsTab from "./product-review/QuestionsTab"
import TabButton from "./product-review/TabButton"
import ReviewEntry from "./product-review/ReviewEntry"
import ReviewForm from "./product-review/ReviewForm"
import ReviewHeader from "./product-review/ReviewHeader"
import ReviewItem from "./product-review/ReviewItem"
import { TabKey, reviewLabel } from "./product-review/helpers"
import { useAuth } from "@/components/providers/AuthProvider"

interface ProductReviewsProps {
    productId: string
    productTitle: string
    shortDescription?: string
    measurements?: string | null
    weight?: string | null
}

const ProductReviews = ({ productId, productTitle, shortDescription, measurements, weight }: ProductReviewsProps) => {
    const [activeTab, setActiveTab] = useState<TabKey>("reviews")
    const [sortBy, setSortBy] = useState("newest")
    const [visibleCount, setVisibleCount] = useState(2)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [reviewText, setReviewText] = useState("")
    const [reviewRating, setReviewRating] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
    const [canWriteReview, setCanWriteReview] = useState(false)
    const { user } = useAuth()
    const userId = user?.id ?? null

    const loadReviews = useCallback(async () => {
        setLoading(true)
        const { data } = await getReviews(productId, sortBy)
        if (data) setReviews(data)
        setLoading(false)
    }, [productId, sortBy])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    useEffect(() => {
        const checkEligibility = async () => {
            if (!userId) {
                setCanWriteReview(false)
                return
            }

            const { canReview } = await canUserReviewProduct(productId)
            setCanWriteReview(canReview)
        }

        void checkEligibility()
    }, [productId, userId])

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    const startEditingReview = (review: Review) => {
        setEditingReviewId(review.id)
        setReviewText(review.text)
        setReviewRating(review.rating)
        setShowForm(true)
    }

    const resetReviewForm = () => {
        setShowForm(false)
        setEditingReviewId(null)
        setReviewText("")
        setReviewRating(0)
    }

    const handleSubmitReview = async () => {
        if (!reviewText.trim()) {
            toast.error("Please write your review")
            return
        }
        if (reviewRating === 0) {
            toast.error("Please select a rating")
            return
        }

        setSubmitting(true)
        const { error } = editingReviewId
            ? await updateReview({
                id: editingReviewId,
                rating: reviewRating,
                text: reviewText.trim(),
            })
            : await createReview({
                product_id: productId,
                rating: reviewRating,
                text: reviewText.trim(),
            })
        setSubmitting(false)

        if (error) {
            toast.error(error)
            return
        }

        toast.success(editingReviewId ? "Review updated!" : "Review submitted!")
        resetReviewForm()
        loadReviews()
    }

    const handleDeleteReview = async (reviewId: string) => {
        const { error } = await deleteReview(reviewId)
        if (error) {
            toast.error(error)
            return false
        }
        toast.success("Review deleted")
        loadReviews()
        return true
    }

    const handleToggleLike = async (reviewId: string) => {
        if (!userId) {
            toast.error("Please sign in to like a review")
            return
        }

        const { error } = await toggleReviewLike(reviewId)
        if (error) {
            toast.error(error)
            return
        }

        loadReviews()
    }

    const handleAddReply = async (reviewId: string, text: string) => {
        if (!userId) {
            toast.error("Please sign in to reply")
            return false
        }

        const { error } = await createReviewReply({ review_id: reviewId, text })
        if (error) {
            toast.error(error)
            return false
        }

        toast.success("Reply added")
        await loadReviews()
        return true
    }

    const handleDeleteReply = async (replyId: string) => {
        const { error } = await deleteReviewReply(replyId)
        if (error) {
            toast.error(error)
            return false
        }

        toast.success("Reply deleted")
        await loadReviews()
        return true
    }

    const visibleReviews = reviews.slice(0, visibleCount)
    const renderReviewsContent = () => (
        <div className="mt-4 md:mt-10">
            <h2 className="font-poppins text-2xl font-[500]">Customer Reviews</h2>
            <div className="flex items-center gap-3 mt-3">
                <StarRating rating={Math.round(avgRating * 2) / 2} />
                <p className="text-gray-600 text-sm">{reviewLabel(reviews.length)}</p>
            </div>

            <p className="mt-2">{productTitle}</p>

            {!showForm ? (
                canWriteReview ? (
                    <ReviewEntry
                        userId={userId}
                        reviews={reviews}
                        onStartEditingReview={startEditingReview}
                        onShowForm={() => setShowForm(true)}
                    />
                ) : null
            ) : (
                <ReviewForm
                    reviewRating={reviewRating}
                    setReviewRating={setReviewRating}
                    reviewText={reviewText}
                    setReviewText={setReviewText}
                    submitting={submitting}
                    editingReviewId={editingReviewId}
                    onSubmit={handleSubmitReview}
                    onCancel={resetReviewForm}
                />
            )}

            <ReviewHeader
                totalReviews={reviews.length}
                sortBy={sortBy}
                onSortByChange={(value) => {
                    setSortBy(value)
                    setVisibleCount(2)
                }}
            />

            {loading ? (
                <p className="mt-4 md:mt-10 text-gray-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p className="mt-4 md:mt-10 text-gray-500">No reviews yet. Be the first to review this product!</p>
            ) : (
                <div className="mt-10 space-y-10">
                    {visibleReviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            userId={userId}
                            isOwner={userId === review.user_id}
                            onEdit={startEditingReview}
                            onDelete={handleDeleteReview}
                            onToggleLike={handleToggleLike}
                            onAddReply={handleAddReply}
                            onDeleteReply={handleDeleteReply}
                        />
                    ))}
                </div>
            )}

            {visibleCount < reviews.length && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={() => setVisibleCount(reviews.length)}
                        className="border px-8 py-3 rounded-full hover:bg-black hover:text-white transition"
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <div className="mt-10 md:mt-20">
            <div className="md:hidden flex flex-col w-full">
                <div>
                    <TabButton tab="info" activeTab={activeTab} onClick={setActiveTab} label="Additional Info" />
                    {activeTab === "info" && (
                        <div className="pb-8">
                            <AdditionalInfoTab
                                shortDescription={shortDescription}
                                measurements={measurements}
                                weight={weight}
                            />
                        </div>
                    )}
                </div>
                <div className="border-t border-transparent">
                    <TabButton tab="questions" activeTab={activeTab} onClick={setActiveTab} label="Questions" />
                    {activeTab === "questions" && (
                        <div className="pb-8">
                            <QuestionsTab />
                        </div>
                    )}
                </div>
                <div className="border-t border-transparent">
                    <TabButton tab="reviews" activeTab={activeTab} onClick={setActiveTab} label="Reviews" count={reviews.length} />
                    {activeTab === "reviews" && (
                        <div className="pb-8">
                            {renderReviewsContent()}
                        </div>
                    )}
                </div>
                <div className="border-b border-lightgray w-full" />
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block">
                <div className="flex flex-row items-start gap-8 border-b border-lightgray text-gray-500 text-sm font-medium">
                    <TabButton tab="info" activeTab={activeTab} onClick={setActiveTab} label="Additional Info" />
                    <TabButton tab="questions" activeTab={activeTab} onClick={setActiveTab} label="Questions" />
                    <TabButton tab="reviews" activeTab={activeTab} onClick={setActiveTab} label="Reviews" count={reviews.length} />
                </div>

                <div className="mt-10">
                    {activeTab === "info" && (
                        <AdditionalInfoTab
                            shortDescription={shortDescription}
                            measurements={measurements}
                            weight={weight}
                        />
                    )}

                    {activeTab === "questions" && (
                        <QuestionsTab />
                    )}

                    {activeTab === "reviews" && renderReviewsContent()}
                </div>
            </div>
        </div>
    )
}

export default ProductReviews