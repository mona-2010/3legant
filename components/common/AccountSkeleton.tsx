import React from "react";

export default function AccountSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-16 min-h-[80vh] animate-pulse">
      <div className="flex-1 mb-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-full bg-gray-100 rounded" />
          ))}
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded mt-8" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-36 h-36 bg-gray-200 rounded-full mb-6" />
        <div className="h-6 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
