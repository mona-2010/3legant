import React from "react";

export default function ProductDetailSkeleton() {
  return (
    <div>
      <div className="mt-20 mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]">
        <div className="my-[16px]">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row gap-15">
          <div className="flex flex-col gap-1 md:w-1/2">
            <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex justify-between items-center gap-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-30 h-30 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 mt-8 md:mt-0">
            <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mt-4" />
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse mt-2" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="mt-12">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
