"use client"
import React from "react"

export const categories = [
    "All Rooms",
    "Living Room",
    "Bedroom",
    "Kitchen",
    "Bathroom",
    "Dining",
    "Outdoor",
]

export const prices = ["all", "0-99", "100-199", "200-299", "300-399", "400+"]

type FilterBarProps = {
    selectedCategory: string
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
    selectedPrices: string[]
    setSelectedPrices: React.Dispatch<React.SetStateAction<string[]>>
}

const FilterBar: React.FC<FilterBarProps> = ({
    selectedCategory,
    setSelectedCategory,
    selectedPrices,
    setSelectedPrices,
}) => {

    const handlePriceChange = (price: string) => {
        if (price === "all") {
            setSelectedPrices(["all"])
            return
        }

        setSelectedPrices((prev) =>
            prev.includes(price)
                ? prev.filter((p) => p !== price)
                : [...prev.filter(p => p !== "all"), price]
        )
    }

    return (
        <div className="flex flex-col gap-8">

            <div className="overflow-auto h-50">
                <h4 className="uppercase text-sm font-semibold mb-4">Categories</h4>
                <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                        <p
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`cursor-pointer ${
                                selectedCategory === cat
                                    ? "font-semibold underline"
                                    : "text-gray-500 hover:text-black"
                            }`}
                        >
                            {cat}
                        </p>
                    ))}
                </div>
            </div>

            {/* Prices */}
            <div>
                <h4 className="uppercase text-sm font-semibold mb-4">Price</h4>
                <div className="flex flex-col gap-2">
                    {prices.map((price) => (
                        <label
                            key={price}
                            className="flex justify-between items-center cursor-pointer"
                        >
                            <span className="capitalize">{price}</span>

                            <input
                                type="checkbox"
                                checked={selectedPrices.includes(price)}
                                onChange={() => handlePriceChange(price)}
                                className="w-5 h-5 rounded-md border border-gray-400 appearance-none cursor-pointer relative
                                before:content-[''] before:absolute before:inset-0 before:flex before:items-center before:justify-center
                                checked:before:content-['✓'] checked:before:text-white checked:before:text-sm
                                checked:bg-black transition-all"
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FilterBar