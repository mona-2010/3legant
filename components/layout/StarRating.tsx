import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"

type StarRatingProps = {
  rating: number
}

export const StarRating = ({ rating }: StarRatingProps) => {
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
