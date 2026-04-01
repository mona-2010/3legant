"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCategory, isProductCategory } from "@/types";
import { isProductNew } from "@/lib/utils/product-utils";

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

const fetchProducts = async () => {
  if (store.products.length === 0) {
    store.loading = true;
    notify();
  }
  
  const fetchTimeout = setTimeout(() => {
    if (store.loading) {
      store.loading = false;
      notify();
    }
  }, 10000); 
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("products").select("*");
    
    if (error) {
      throw error;
    }
    
    if (data) {
      store.products = data.map((p: any) => ({
        ...p,
        is_new: isProductNew(p.created_at),
        color: Array.isArray(p.color) ? p.color : p.color ? [p.color] : [],
        category: Array.isArray(p.category)
          ? p.category.filter((value: any): value is ProductCategory => isProductCategory(value))
          : [],
      }));
      console.log("Products fetch: Store successfully updated.");
    } else {
      console.warn("Products fetch: No data returned from Supabase.");
    }
  } catch (err) {
    fetchPromise = null; 
  } finally {
    clearTimeout(fetchTimeout);
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
        const channel = supabase
          .channel("global_products_sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products" },
            (payload: any) => {
              console.log(`Products fetch: Realtime ${payload.eventType} detected.`);
              
              const normalize = (p: any) => ({
                ...p,
                is_new: isProductNew(p.created_at),
                color: Array.isArray(p.color) ? p.color : p.color ? [p.color] : [],
                category: Array.isArray(p.category)
                  ? p.category.filter((value: any): value is ProductCategory => isProductCategory(value))
                  : [],
              });

              if (payload.eventType === "INSERT") {
                const newProduct = normalize(payload.new);
                store.products = [newProduct, ...store.products];
                notify();
              } else if (payload.eventType === "UPDATE") {
                const updatedProduct = normalize(payload.new);
                store.products = store.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
                notify();
              } else if (payload.eventType === "DELETE") {
                store.products = store.products.filter(p => p.id !== payload.old.id);
                notify();
              } else {
                void fetchProducts();
              }
            }
          )
          .subscribe((status: any) => {
          });
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
