"use client"

import { TabKey } from "./helpers"

interface TabButtonProps {
    tab: TabKey
    activeTab: TabKey
    onClick: (tab: TabKey) => void
    label: string
}

export default function TabButton({ tab, activeTab, onClick, label }: TabButtonProps) {
    return (
        <button
            onClick={() => onClick(tab)}
            className={activeTab === tab ? "text-black border-b-2 border-transparent border-black" : ""}
        >
            {label}
        </button>
    )
}
