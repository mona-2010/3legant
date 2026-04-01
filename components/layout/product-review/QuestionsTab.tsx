import FAQAccordion, { furnitureFAQs } from "@/components/layout/FaqAccordion"
import { defaultQuestionTitle } from "./helpers"

export default function QuestionsTab() {
    return (
        <div className="mt-10">
            <h2 className="font-poppins text-2xl font-[500]">{defaultQuestionTitle}</h2>
            <FAQAccordion faqs={furnitureFAQs} />
        </div>
    )
}
