"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { RxCross2 } from "react-icons/rx";
import TintedProductImage from "./TintedProductImage";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  color?: string[];
}

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function SearchModal({ open, setOpen }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRequestSeqRef = useRef(0);
  const lastSearchedQueryRef = useRef("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      lastSearchedQueryRef.current = "";
      return;
    }

    const timer = setTimeout(async () => {
      if (lastSearchedQueryRef.current === trimmed) return;

      const requestId = ++searchRequestSeqRef.current;
      const { data } = await supabase
        .from("products")
        .select("id,title,price,image,color")
        .ilike("title", `%${trimmed}%`)
        .limit(4);

      if (requestId !== searchRequestSeqRef.current) return;
      lastSearchedQueryRef.current = trimmed;
      setResults((data as Product[]) || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [open, query, supabase]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 transition-opacity duration-300"
      style={{ overflowY: "auto" }}
    >
      <div
        ref={modalRef}
        className="w-[90%] max-w-[600px] mt-8 rounded-lg p-6 bg-background shadow-lg transition-transform duration-300 transform animate-slide-down"
        style={{ maxHeight: "70vh", overflowY: "auto", marginTop: 0, animation: open ? "slideDown 0.35s cubic-bezier(0.4,0,0.2,1)" : "none" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Search Products</h2>
          <RxCross2
            className="text-xl cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
              <div className="relative w-[50px] h-[50px]">
                <TintedProductImage
                  src={product.image}
                  alt={product.title}
                  fill
                  colorHex={product.color?.[0]}
                  className="object-contain"
                  sizes="50px"
                />
              </div>
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-sm text-gray-500">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        body {
          overscroll-behavior: none !important;
        }
      `}</style>
    </div>
  );
}