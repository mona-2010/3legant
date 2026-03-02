"use client"
import { BsGridFill, BsGrid3X3GapFill } from "react-icons/bs"
import { IoGridSharp } from "react-icons/io5"
import { MdViewAgenda } from "react-icons/md"
type Props = {
    setGrid: (value: string) => void
    grid: string
    setSort: (value: string) => void
    selectedCategory: string
}

const SortBar = ({ setGrid, grid, setSort, selectedCategory }: Props) => {
    return (
        <div className="flex flex-col items-start md:flex-row justify-between items-center mb-8">
            <div className="text-lg font-semibold">{selectedCategory}</div>
            <div className="flex items-center gap-1 md:gap-5">
                <div className="relative">
                    <select
                        onChange={(e) => setSort(e.target.value)}
                        className="appearance-none bg-transparent text-sm py-1 rounded-md cursor-pointer outline-none"
                    >
                        <option value="default">Sort By</option>
                        <option value="newest">Newest</option>
                        <option value="low">Price: Low to High</option>
                        <option value="high">Price: High to Low</option>
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm">▼</span>
                </div>

                <div className="flex text-2xl bg-white rounded-md p-1 gap-2">
                    <BsGrid3X3GapFill
                        onClick={() => setGrid("3")}
                        className={`cursor-pointer p-1 rounded ${grid === "3" ? "bg-gray-200" : "text-gray-500"}`}
                    />

                    <BsGridFill
                        onClick={() => setGrid("4")}
                        className={`cursor-pointer p-1 rounded ${grid === "4" ? "bg-gray-200" : "text-gray-500"}`}
                    />

                    <IoGridSharp
                        onClick={() => setGrid("2")}
                        className={`cursor-pointer p-1 rounded ${grid === "2" ? "bg-gray-200" : "text-gray-500"}`}
                    />

                    <MdViewAgenda
                        onClick={() => setGrid("1")}
                        className={`cursor-pointer p-1 rounded ${grid === "1" ? "bg-gray-200" : "text-gray-500"}`}
                    />
                </div>
            </div>
        </div>
    )
}

export default SortBar