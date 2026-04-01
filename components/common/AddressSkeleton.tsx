import React from "react";

export default function AddressSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6 flex flex-col justify-between max-h-[200px]">
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between mb-3">
            <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
            <div className="flex items-center gap-3">
              <div className="h-4 w-10 bg-gray-100 rounded" />
              <div className="h-4 w-10 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex flex-col text-[14px] leading-[22px] gap-1">
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
