import { FaCheck } from "react-icons/fa";

type Props = { activeStep: number };

export default function StepIndicator({ activeStep }: Props) {
  const steps = [
    { id: 1, label: "Shopping Cart" },
    { id: 2, label: "Checkout Details" },
    { id: 3, label: "Order Complete" },
  ];

  return (
    <div className="flex justify-center gap-20 my-8">
      {steps.map(step => {
        const isActive = step.id === activeStep;
        const isCompleted = step.id < activeStep;

        return (
          <div key={step.id} className={`flex items-center gap-3 pr-20
           ${isCompleted ? "border-b-3 pb-4 border-green-500" : isActive ? "border-b-3 pb-4" : ""}`}>
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                ${isCompleted ? "bg-green-500" : isActive ? "bg-black" : "bg-gray-300"}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${isCompleted ? "bg-green-500" : isActive ? "bg-black" : "bg-gray-300"
                }`}>
                {isCompleted ? (
                  <FaCheck/>) : (<span>{step.id}</span>)}
              </div>
            </div>
            <span
              className={`font-semibold
                ${isCompleted ? "text-green-600" : isActive ? "text-black " : "text-gray-400"}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}