import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export const furnitureFAQs: FAQItem[] = [
  {
    question: "What materials are used in your furniture?",
    answer:
      "Our furniture is made from high-quality solid wood, engineered wood, metal, and premium fabrics to ensure durability and style.",
  },
  {
    question: "Do you offer customization options?",
    answer:
      "Yes, selected furniture pieces can be customized in size, fabric, color, and finish to match your interior design.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery usually takes between 5–10 business days depending on your location and product availability.",
  },
  {
    question: "Do you provide furniture installation?",
    answer:
      "Yes, we provide professional installation services for certain furniture items to ensure proper setup.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return or replacement policy for damaged or defective products.",
  },
];

interface FAQAccordionProps {
  faqs: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-6 w-full">
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-lightgray rounded-md p-4"
          >
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <h3 className="font-semibold text-lg text-foreground">
                {faq.question}
              </h3>

              <span className="text-xl font-bold">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                openIndex === index ? "max-h-40 mt-3" : "max-h-0"
              }`}
            >
              <p className="text-gray-200 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion;