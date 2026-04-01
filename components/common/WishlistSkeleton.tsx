import React from "react";

export default function WishlistSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
