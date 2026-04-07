"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCategory, isProductCategory } from "@/types";
import { isProductNew } from "@/lib/utils/product-utils";
import { getEffectiveProductPrice } from "@/lib/utils/product-pricing";

export interface ProductType {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  valid_until?: string | null;
  image: string;
  color?: string[];
  rating?: number;
  review_count?: number;
  category?: ProductCategory[];
  is_new?: boolean;
  created_at: string;
  is_active?: boolean;
  stock?: number;
}

interface ProductsStore {
  products: ProductType[];
  loading: boolean;
}

export type ProductSort = "default" | "newest" | "low" | "high";

interface UsePaginatedProductsOptions {
  category?: ProductCategory | "all";
  selectedPrices?: string[];
  sort?: ProductSort;
  pageSize?: number;
  enabled?: boolean;
}

const VALID_PRICE_RANGES = new Set(["0-99", "100-199", "200-299", "300-399", "400+"]);

const isPriceInRange = (price: number, range: string) => {
  if (range === "0-99") return price <= 99;
  if (range === "100-199") return price >= 100 && price <= 199;
  if (range === "200-299") return price >= 200 && price <= 299;
  if (range === "300-399") return price >= 300 && price <= 399;
  if (range === "400+") return price >= 400;
  return false;
};

let store: ProductsStore = {
  products: [],
  loading: true,
};

let fetchPromise: Promise<void> | null = null;
let isSubscribed = false;

const listeners = new Set<() => void>();
const notify = () => {
  listeners.forEach((l) => l());
};

const normalizeProduct = (p: any): ProductType => ({
  ...p,
  price: getEffectiveProductPrice(p),
  is_new: isProductNew(p.created_at),
  color: Array.isArray(p.color) ? p.color : p.color ? [p.color] : [],
  category: Array.isArray(p.category)
    ? p.category.filter((value: any): value is ProductCategory => isProductCategory(value))
    : [],
});

const fetchProducts = async () => {
  if (store.products.length === 0) {
    store.loading = true;
    notify();
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      throw error;
    }

    if (data) {
      store.products = data.map(normalizeProduct);
    }
  } catch (_err) {
    fetchPromise = null;
  } finally {
    store.loading = false;
    notify();
  }
};

export function useProducts() {
  const [sessionStore, setSessionStore] = useState(store);

  useEffect(() => {
    const handleChange = () => {
      setSessionStore({ ...store });
    };

    listeners.add(handleChange);
    if (!fetchPromise) {
      fetchPromise = fetchProducts();

      if (!isSubscribed) {
        isSubscribed = true;
        const supabase = createClient();
        supabase
          .channel("global_products_sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products" },
            (payload: any) => {
              const normalize = (p: any) => normalizeProduct(p);

              if (payload.eventType === "INSERT") {
                const newProduct = normalize(payload.new);
                store.products = [newProduct, ...store.products];
                notify();
              } else if (payload.eventType === "UPDATE") {
                const updatedProduct = normalize(payload.new);
                store.products = store.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
                notify();
              } else if (payload.eventType === "DELETE") {
                store.products = store.products.filter((p) => p.id !== payload.old.id);
                notify();
              } else {
                void fetchProducts();
              }
            }
          )
          .subscribe();
      }
    } else {
      handleChange();
      if (!store.loading && store.products.length === 0) {
        fetchPromise = fetchProducts();
      }
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return sessionStore;
}

export function usePaginatedProducts({
  category = "all",
  selectedPrices = ["all"],
  sort = "default",
  pageSize = 6,
  enabled = true,
}: UsePaginatedProductsOptions) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const inFlightRef = useRef(false);

  const queryKey = useMemo(() => {
    const normalizedPrices = selectedPrices
      .filter((price) => price !== "all")
      .slice()
      .sort()
      .join("|");

    return `${category}|${sort}|${normalizedPrices}|${pageSize}|${enabled}`;
  }, [category, sort, selectedPrices, pageSize, enabled]);

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    if (!enabled || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const supabase = createClient();
      let query: any = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (category !== "all") {
        query = query.contains("category", [category]);
      }
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const normalized = (data || []).map(normalizeProduct);
      const validRanges = selectedPrices.filter((range) => VALID_PRICE_RANGES.has(range));
      const shouldApplyPriceFilters = validRanges.length > 0 && !selectedPrices.includes("all");

      const filteredProducts = shouldApplyPriceFilters
        ? normalized.filter((product: ProductType) => validRanges.some((range) => isPriceInRange(product.price, range)))
        : normalized;

      const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sort === "low") {
          return a.price - b.price;
        }

        if (sort === "high") {
          return b.price - a.price;
        }

        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
      });

      const pageItems = sortedProducts.slice(offset, offset + pageSize);
      const hasMoreProducts = offset + pageSize < sortedProducts.length;

      setProducts((prev) => (append ? [...prev, ...pageItems] : pageItems));
      setHasMore(hasMoreProducts);
    } catch (_error) {
      if (!append) {
        setProducts([]);
      }
      setHasMore(false);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, enabled, pageSize, selectedPrices, sort]);

  useEffect(() => {
    setProducts([]);
    setHasMore(false);

    if (!enabled) {
      setLoading(false);
      setLoadingMore(false);
      inFlightRef.current = false;
      return;
    }

    void fetchPage(0, false);
  }, [fetchPage, queryKey, enabled]);

  const fetchMore = useCallback(async () => {
    if (!enabled || loading || loadingMore || !hasMore) {
      return;
    }

    await fetchPage(products.length, true);
  }, [enabled, fetchPage, hasMore, loading, loadingMore, products.length]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    fetchMore,
  };
}
