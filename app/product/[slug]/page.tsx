"use client";

import { useProducts } from "@/lib/hooks/useProducts";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/BreadCrumb";
import { Header, NavigationHeader } from "@/components/dynamicComponents";
import Footer from "@/components/layout/Footer";
import Newsletter from "@/components/layout/NewsLetter";
import ProductReviews from "@/components/layout/ProductReview";
import ProductImageGallery from "@/components/layout/ProductImagegallery";
import { createClient } from "@/lib/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "@/store/cartSlice";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCart } from "@/lib/cart/fetchCart";
import { addItemToCart } from "@/lib/cart/mutations";
import { toast } from "react-toastify";
import ProductInfo from "./ProductInfo";
import ProductDetailSkeleton from "@/components/common/ProductDetailSkeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { isProductCategory, ProductCategory } from "@/types";
import {
    addToWishlist,
    fetchWishlist,
    removeFromWishlist,
    selectIsWishlisted,
    setColorPreference,
} from "@/store/wishlistSlice";

type Product = {
    id: string;
    title: string;
    description: string;
    image: string;
    images?: string[];
    color?: string[];
    price: number;
    original_price?: number;
    valid_until?: string | null;
    category: ProductCategory[];
    rating: number;
    review_count?: number;
    short_description?: string;
    measurements?: string | null;
    weight?: string | null;
    is_new?: boolean;
    is_active?: boolean;
    sku?: string;
    stock?: number;
};

export default function ProductDetailPage() {
    const params = useParams();
    const supabase = useMemo(() => createClient(), []);
    const dispatch = useDispatch<AppDispatch>();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const { user } = useAuth();
    const { products: allProducts } = useProducts();
    const initialProduct = useMemo(() => {
        return allProducts.find((p) => p.id === params.slug) as Product || null;
    }, [allProducts, params.slug]);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [quantity, setQuantity] = useState(1);
    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
    const userId = user?.id ?? null;

    const product = initialProduct;
    const productId = product?.id || "";
    const liked = useSelector(selectIsWishlisted(productId));

    useEffect(() => {
        if (!userId) return;
        dispatch(fetchWishlist({ userId }));
    }, [dispatch, userId]);

    useEffect(() => {
        const colors = product?.color ?? [];

        if (colors.length === 0) {
            setSelectedColorIndex(null);
            return;
        }

        setSelectedColorIndex((prev) => {
            if (prev !== null && prev < colors.length) {
                return prev;
            }
            return 0;
        });
    }, [product?.id, product?.color]);

    const productImages = product
        ? [...(product.image ? [product.image] : []), ...(product.images || []).filter((img) => img !== product.image)]
        : [];

    const selectedColorHex = selectedColorIndex !== null ? product?.color?.[selectedColorIndex] : undefined;

    const updateQuantity = (type: "inc" | "dec") => {
        setQuantity((prev) => {
            if (type === "inc" && typeof product?.stock === "number") {
                return Math.min(prev + 1, product.stock);
            }
            return type === "inc" ? prev + 1 : Math.max(1, prev - 1);
        });
    };

    useEffect(() => {
        if (!product?.valid_until) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
        const targetDate = new Date(product.valid_until).getTime();
        if (Number.isNaN(targetDate) || targetDate <= Date.now()) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
        const interval = setInterval(() => {
            const diff = targetDate - Date.now();
            if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); clearInterval(interval); return; }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [product?.valid_until]);


    const toggleWishlist = async (selectedColor?: string | null) => {
        if (!userId) {
            toast.error("Login to add items to wishlist");
            return;
        }
        if (!product) return;

        if (liked) {
            const result = await dispatch(removeFromWishlist({ userId, productId: product.id }));
            if (removeFromWishlist.fulfilled.match(result)) {
                toast.info("Removed from wishlist");
            } else {
                toast.error((result.payload as string) || "Could not remove from wishlist");
            }
        } else {
            const result = await dispatch(addToWishlist({ userId, productId: product.id, color: selectedColor }));
            if (addToWishlist.fulfilled.match(result)) {
                dispatch(setColorPreference({ productId: product.id, color: selectedColor || null }));
                toast.success("Added to wishlist");
            } else {
                toast.error((result.payload as string) || "Could not add to wishlist");
            }
        }
    };

    const addToCartHandler = async () => {
        if (!product) return;
        if (!user) { toast.error("Login to add items to cart"); return; }
        const currentProductQty = cartItems
            .filter((item) => item.product_id === product.id)
            .reduce((sum, item) => sum + item.quantity, 0);
        const selectedQty = Math.max(1, quantity);
        if (typeof product.stock === "number" && currentProductQty + selectedQty > product.stock) {
            toast.error("Stock limit exceeded");
            return;
        }
        const selectedColorName = selectedColorIndex !== null ? product.color?.[selectedColorIndex] ?? null : null;
        const added = await addItemToCart({ userId: user.id, productId: product.id, quantity, color: selectedColorName });
        if (!added) {
            toast.error("Stock limit exceeded");
            return;
        }
        const items = await fetchCart(user.id);
        dispatch(setCart(items));
        toast.success(`${product.title} added to cart`);
    };

    if (!product) return <ProductDetailSkeleton />;

    const offerEnd = product.valid_until ? new Date(product.valid_until).getTime() : null;
    const hasActiveDiscount = !!product.original_price && product.original_price > product.price && !!offerEnd && offerEnd > Date.now();
    const effectiveOriginalPrice = hasActiveDiscount ? product.original_price : 0;
    const currentProductQty = cartItems
        .filter((item) => item.product_id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
    const isStockLimitReached =
        typeof product.stock === "number" && currentProductQty + Math.max(1, quantity) > product.stock;

    return (
        <div>
            <NavigationHeader />
            <Header />
            <div className="page-content-container">
                <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]">
                    <div className="my-[16px]">
                        <Breadcrumb
                            currentPage={product.title}
                            crumbs={[
                                { title: "Shop", href: "/shop" },
                                { title: product.category?.[0], href: `/shop?category=${product.category?.[0]}` },
                            ]}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 md:gap-10 lg:gap-15">
                        <div className="flex flex-col gap-1 md:w-1/2">
                            <ProductImageGallery
                                images={productImages.length > 0 ? productImages : product.image ? [product.image] : []}
                                price={product.price}
                                originalPrice={effectiveOriginalPrice}
                                valid_until={product.valid_until}
                                isNew={product.is_new}
                                colorHex={selectedColorHex}
                            />
                        </div>
                        <ProductInfo
                            product={product}
                            timeLeft={timeLeft}
                            selectedColorIndex={selectedColorIndex}
                            setSelectedColorIndex={setSelectedColorIndex}
                            quantity={quantity}
                            updateQuantity={updateQuantity}
                            liked={liked}
                            toggleWishlist={toggleWishlist}
                            addToCartHandler={addToCartHandler}
                            isStockLimitReached={isStockLimitReached}
                        />
                    </div>
                    <ProductReviews
                        productId={product.id}
                        productTitle={product.title}
                        shortDescription={product.short_description}
                        measurements={product.measurements}
                        weight={product.weight}
                    />
                </div>
                <Newsletter />
            </div>
            <Footer />
        </div>
    );
}
