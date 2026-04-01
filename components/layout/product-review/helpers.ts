import { FAQItem } from "@/components/layout/FaqAccordion"

export type TabKey = "info" | "questions" | "reviews"

export function reviewLabel(count: number) {
    return `${count} Review${count !== 1 ? "s" : ""}`
}

export function timeAgo(dateStr: string) {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)

    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`
    if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "just now"
}

export const additionalInfoContent = {
    details:
        "You can use the removable tray for serving. The design makes it easy to put the tray back after use since you place it directly on the table frame without having to fit it into any holes.",
    packaging: `Width: 20 \" Height: 1 ½ \" Length: 21 ½ \"\nWeight: 7 lb 8 oz\nPackage(s): 1`,
}

export const defaultQuestionTitle = "Questions"

export type FurnitureFaqItems = FAQItem[]
