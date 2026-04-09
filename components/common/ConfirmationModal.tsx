"use client";

import { useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { LucideIcon } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
  variant?: "primary" | "danger";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon: Icon,
  variant = "primary",
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmButtonClass = 
    variant === "danger" 
      ? "bg-red-600 hover:bg-red-700 text-white" 
      : "bg-black hover:bg-black/90 text-white";

  const iconBgClass = 
    variant === "danger"
      ? "bg-red-50 text-red-600"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/70 transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
             {Icon && (
               <div className={`p-3 rounded-full ${iconBgClass}`}>
                  <Icon className="w-6 h-6" />
               </div>
             )}
            <button 
              onClick={onClose}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
            >
              <RxCross2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 font-inter text-[15px] leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-medium text-gray-700 bg-lightgray hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
