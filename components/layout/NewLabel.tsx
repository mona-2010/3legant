import { GoHeart } from "react-icons/go"

interface NewLabelProps {
  price: number
  originalPrice?: number
  validUntil?: string | null
  isNew?: boolean
}

export const NewLabel = ({ price, originalPrice, validUntil, isNew }: NewLabelProps) => {
  const offerEnd = validUntil ? new Date(validUntil).getTime() : null
  const hasDiscount = !!(originalPrice && originalPrice > price && offerEnd && offerEnd > Date.now())
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0

  if (!isNew && !hasDiscount) return null

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between z-10 font-inter font-bold m-4">
      <div className="flex flex-col">
        {isNew && (
          <p className="px-2 text-sm text-black bg-white rounded-sm mb-2">
            NEW
          </p>
        )}

        {hasDiscount && (
          <p className="px-2 text-sm text-white bg-green-500 rounded-sm">
            -{discountPercentage}%
          </p>
        )}
      </div>

      <button>
        <GoHeart className="opacity-0 group-hover:opacity-100 text-4xl rounded-full bg-white p-2 transition-opacity" />
      </button>
    </div>
  )
}
