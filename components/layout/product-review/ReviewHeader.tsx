import { reviewLabel } from "./helpers"

interface ReviewHeaderProps {
    totalReviews: number
    sortBy: string
    onSortByChange: (value: string) => void
}

export default function ReviewHeader({ totalReviews, sortBy, onSortByChange }: ReviewHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between md:items-center mt-10 gap-4">
            <h3 className="font-poppins text-[20px] md:text-[28px] font-[500]">{reviewLabel(totalReviews)}</h3>

            <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="cursor-pointer border border-lightgray px-2 py-2 rounded-md text-sm"
            >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
            </select>
        </div>
    )
}
