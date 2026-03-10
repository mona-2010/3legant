"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function SearchModal({ open, setOpen }: Props) {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    const { data } = await supabase
      .from("products")
      .select("id,title,price,image")
      .ilike("title", `%${value}%`)
      .limit(4);

    if (data) setResults(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-center md:justify-end py-12 md:py-24 md:mr-[140px]">
      <div className="bg-background w-[90%] h-fit max-w-[600px] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Search Products</h2>
          <RxCross2
            className="text-xl cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </div>

        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border p-3 rounded-md"
        />

        <div className="mt-4 flex flex-col gap-4">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 hover:bg-gray-100 p-2 rounded"
            >
              <Image
                src={product.image}
                alt={product.title}
                width={50}
                height={50}
                className="object-contain"
              />
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-sm text-gray-500">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}