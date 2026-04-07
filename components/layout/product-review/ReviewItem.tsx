"use client"

import Image from "next/image"
import { useState } from "react"
import { GoHeart, GoHeartFill } from "react-icons/go"
import { RxCross1 } from "react-icons/rx"
import { StarRating } from "@/components/layout/ProductSlider"
import { Review } from "@/types"
import { timeAgo } from "./helpers"
import { BiEditAlt, BiTrash } from "react-icons/bi"
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal"

interface ReviewItemProps {
    review: Review
    userId: string | null
    isOwner: boolean
    onEdit: (review: Review) => void
    onDelete: (reviewId: string) => Promise<boolean>
    onToggleLike: (reviewId: string) => Promise<void>
    onAddReply: (reviewId: string, text: string) => Promise<boolean>
    onDeleteReply: (reviewId: string, replyId: string) => Promise<boolean>
}

export default function ReviewItem({
    review,
    userId,
    isOwner,
    onEdit,
    onDelete,
    onToggleLike,
    onAddReply,
    onDeleteReply,
}: ReviewItemProps) {
    const [replyText, setReplyText] = useState("")
    const [replying, setReplying] = useState(false)
    const [showReplyModal, setShowReplyModal] = useState(false)
    const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null)
    const [deleteReviewOpen, setDeleteReviewOpen] = useState(false)
    const [deletingReview, setDeletingReview] = useState(false)
    const [deleteReplyTarget, setDeleteReplyTarget] = useState<string | null>(null)

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return
        setReplying(true)
        const ok = await onAddReply(review.id, replyText)
        if (ok) {
            setReplyText("")
            setShowReplyModal(false)
        }
        setReplying(false)
    }

    const handleDeleteReply = async (replyId: string) => {
        setDeletingReplyId(replyId)
        const result = await onDeleteReply(review.id, replyId)
        setDeletingReplyId(null)

        if (result) {
            setDeleteReplyTarget(null)
        }
    }

    const handleDeleteReview = async () => {
        setDeletingReview(true)
        try {
            const deleted = await onDelete(review.id)
            if (deleted) {
                setDeleteReviewOpen(false)
            }
        } catch (error) {
            // Parent handler already surfaces the error toast.
        } finally {
            setDeletingReview(false)
        }
    }

    return (
        <div className="flex gap-4 border-b border-lightgray pb-8">
            {review.user_avatar ? (
                <Image
                    src={review.user_avatar}
                    alt={review.user_name}
                    width={60}
                    height={60}
                    className="w-[30px] md:w-[40px] lg:w-[60px] h-[30px] md:h-[40px] lg:h-[60px] rounded-full object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {review.user_name?.charAt(0).toUpperCase() || "?"}
                </div>
            )}

            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{review.user_name}</h4>
                    {isOwner && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit(review)}
                                className="cursor-pointer hover:text-blue-600 transition"
                                aria-label="Edit review"
                            >
                                <BiEditAlt size={20} />
                            </button>
                            <button
                                onClick={() => setDeleteReviewOpen(true)}
                                className="cursor-pointer text-red-500 hover:text-red-700 transition"
                                aria-label="Delete review"
                            >
                                <BiTrash size={20} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                </div>

                <p className="w-1/2 md:w-full text-gray-600 mt-3 text-sm leading-relaxed">{review.text}</p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                    <button
                        onClick={() => onToggleLike(review.id)}
                        className={`cursor-pointer inline-flex items-center gap-1 transition ${review.liked_by_me ? "text-red-600" : "text-gray-600 hover:text-black"}`}
                        aria-label={review.liked_by_me ? "Unlike review" : "Like review"}
                    >
                        {review.liked_by_me ? <GoHeartFill size={16} /> : <GoHeart size={16} />}
                        <span>{review.likes_count}</span>
                    </button>

                    {userId && (
                        <button
                            onClick={() => setShowReplyModal(true)}
                            className="cursor-pointer text-gray-600 hover:text-black transition"
                        >
                            Reply
                        </button>
                    )}
                </div>

                {review.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {review.replies.map((reply) => (
                            <div key={reply.id} className="rounded-lg bg-gray-50 px-4 py-3 w-full">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2">
                                        {reply.user_avatar ? (
                                            <Image
                                                src={reply.user_avatar}
                                                alt={reply.user_name}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
                                                {reply.user_name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{reply.user_name}</p>
                                            <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                                            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{reply.text}</p>
                                        </div>
                                    </div>

                                    {userId === reply.user_id && (
                                        <button
                                            onClick={() => setDeleteReplyTarget(reply.id)}
                                            disabled={deletingReplyId === reply.id}
                                            className="cursor-pointer text-gray-500 hover:text-red-600 transition disabled:opacity-50"
                                            aria-label="Delete reply"
                                        >
                                            <RxCross1 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showReplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-5">
                        <h5 className="text-lg font-semibold">Reply to {review.user_name}</h5>
                        <p className="mt-1 text-sm text-gray-500">Write your response below.</p>

                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                            placeholder="Write a reply..."
                            className="mt-4 w-full border border-lightgray rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="cursor-pointer px-4 py-2 text-sm rounded-full border border-lightgray text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReplySubmit}
                                disabled={replying || !replyText.trim()}
                                className="cursor-pointer px-4 py-2 text-sm rounded-full border border-black text-black hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {replying ? "Replying..." : "Post Reply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                open={deleteReviewOpen}
                title="Delete review?"
                description="This will permanently remove your review from this product."
                confirmText="Delete Review"
                loading={deletingReview}
                onCancel={() => setDeleteReviewOpen(false)}
                onConfirm={handleDeleteReview}
            />

            <ConfirmDeleteModal
                open={!!deleteReplyTarget}
                title="Delete reply?"
                description="This will permanently remove your reply from this review."
                confirmText="Delete Reply"
                loading={!!deleteReplyTarget && deletingReplyId === deleteReplyTarget}
                onCancel={() => setDeleteReplyTarget(null)}
                onConfirm={() => deleteReplyTarget ? handleDeleteReply(deleteReplyTarget) : undefined}
            />
        </div>
    )
}
