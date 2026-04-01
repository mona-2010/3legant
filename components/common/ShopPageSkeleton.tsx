import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ShopPageSkeleton() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
