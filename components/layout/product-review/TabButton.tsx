"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { TabKey } from "./helpers"

interface TabButtonProps {
    tab: TabKey
    activeTab: TabKey
    onClick: (tab: TabKey) => void
    label: string
    count?: number
}

export default function TabButton({ tab, activeTab, onClick, label, count }: TabButtonProps) {
    const isActive = activeTab === tab
    return (
        <button
            onClick={() => onClick(tab)}
            className={`w-full md:w-auto flex justify-between items-center md:block pb-4 transition-all duration-400 ease-in-out -mb-[1px] ${
                isActive
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-black border-b border-lightgray md:border-b-2 md:border-transparent"
            }`}
        >
            <span className={`flex items-center gap-1 text-base md:text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                {label} {count !== undefined && <span>({count})</span>}
            </span>
            <span className="md:hidden text-gray-400 transition-all duration-100 ease-in-out">
                {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
        </button>
    )
}
