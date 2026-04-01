import React from "react";

export default function CartItemSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr] border-b py-5 md:py-6 gap-4 md:gap-0 items-center animate-pulse">
      <div className="flex gap-3 sm:gap-4 items-center">
        <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 bg-gray-200 rounded" />
        <div>
          <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-16 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="flex justify-start md:justify-center">
        <div className="border flex w-fit px-3 py-1 rounded">
          <div className="h-5 w-5 bg-gray-200 rounded mx-1" />
          <div className="h-5 w-5 bg-gray-200 rounded mx-1" />
          <div className="h-5 w-5 bg-gray-200 rounded mx-1" />
        </div>
      </div>
      <div className="text-left md:text-center">
        <div className="h-5 w-12 bg-gray-200 rounded mx-auto" />
      </div>
      <div className="text-left md:text-right font-semibold">
        <div className="h-5 w-16 bg-gray-200 rounded ml-auto" />
      </div>
    </div>
  );
}
