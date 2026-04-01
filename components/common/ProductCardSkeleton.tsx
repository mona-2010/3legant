import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="group bg-white p-4 animate-pulse">
      <div className="relative w-full h-[320px] bg-gray-200 rounded mb-4" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-6 w-1/2 bg-gray-200 rounded" />
        <div className="flex gap-3 mt-2">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
