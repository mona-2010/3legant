"use client";

import { useProducts } from "@/lib/hooks/useProducts";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/BreadCrumb";
import { Header, NavigationHeader } from "@/components/dynamicComponents";
import Footer from "@/components/layout/Footer";
import Newsletter from "@/components/layout/NewsLetter";
import ProductReviews from "@/components/layout/ProductReview";
import ProductImageGallery from "@/components/layout/ProductImagegallery";
import { createClient } from "@/lib/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { setCart, upsertCartItem } from "@/store/cartSlice";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCart } from "@/lib/cart/fetchCart";
import { addItemToCart, updateCartItemQuantity } from "@/lib/cart/mutations";
import { toast } from "react-toastify";
import ProductInfo from "./ProductInfo";
import ProductDetailSkeleton from "@/components/common/ProductDetailSkeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { isProductCategory, ProductCategory } from "@/types";
import { getEffectiveProductPrice, hasActiveDiscount } from "@/lib/utils/product-pricing";
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
    const router = useRouter();
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
    const [isAddingToCart, setIsAddingToCart] = useState(false);
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

    const selectedColorName = selectedColorIndex !== null ? product?.color?.[selectedColorIndex] ?? null : null;
    const normalizeColor = (value?: string | null) => value ?? null;

    const selectedVariantCartItem = product
        ? cartItems.find(
            (item) =>
                item.product_id === product.id &&
                normalizeColor(item.color) === normalizeColor(selectedColorName)
        )
        : undefined;

    const selectedVariantQtyInCart = selectedVariantCartItem?.quantity ?? 0;

    const currentProductQty = cartItems
        .filter((item) => item.product_id === product?.id)
        .reduce((sum, item) => sum + item.quantity, 0);

    const qtyOfOtherVariants = Math.max(0, currentProductQty - selectedVariantQtyInCart);

    useEffect(() => {
        if (!product) return;

        if (selectedVariantQtyInCart > 0) {
            setQuantity(selectedVariantQtyInCart);
            return;
        }

        setQuantity(1);
    }, [product?.id, selectedColorIndex, selectedVariantQtyInCart]);

    const updateQuantity = (type: "inc" | "dec") => {
        setQuantity((prev) => {
            if (type === "inc" && typeof product?.stock === "number") {
                const maxAllowedForThisVariant = Math.max(1, product.stock - qtyOfOtherVariants);
                return Math.min(prev + 1, maxAllowedForThisVariant);
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
            router.push("/sign-in");
            return;
        }
        if (!product) return;

        if (liked) {
            await dispatch(removeFromWishlist({ userId, productId: product.id }));
        } else {
            const result = await dispatch(addToWishlist({ userId, productId: product.id, color: selectedColor }));
            if (addToWishlist.fulfilled.match(result)) {
                dispatch(setColorPreference({ productId: product.id, color: selectedColor || null }));
            }
        }
    };

    const addToCartHandler = async () => {
        if (!product) return;
        if (!user) { router.push("/sign-in"); return; }
        if (isAddingToCart) return;

        setIsAddingToCart(true);

        const selectedQty = Math.max(1, quantity);
        if (typeof product.stock === "number" && qtyOfOtherVariants + selectedQty > product.stock) {
            toast.error("Stock limit exceeded");
            setIsAddingToCart(false);
            return;
        }

        try {
            if (selectedVariantCartItem) {
                const updateOk = await updateCartItemQuantity(selectedVariantCartItem.id, selectedQty);
                if (!updateOk) {
                    toast.error("Could not update cart quantity");
                    return;
                }

                dispatch(upsertCartItem({
                    ...selectedVariantCartItem,
                    quantity: selectedQty,
                }));

                toast.success(`${product.title} quantity updated in cart`);
                return;
            }

            const result = await addItemToCart({ userId: user.id, productId: product.id, quantity, color: selectedColorName });
            if (!result.success || !result.item) {
                toast.error("Stock limit exceeded");
                return;
            }
            dispatch(upsertCartItem({
                id: result.item.id,
                product_id: result.item.product_id,
                name: product.title,
                image: product.image,
                price: getEffectiveProductPrice(product),
                quantity: result.item.quantity,
                color: result.item.color ?? undefined,
                stock: product.stock,
            }));
            toast.success(`${product.title} added to cart`);
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (!product) return <ProductDetailSkeleton />;

    const isDiscountActive = hasActiveDiscount(product);
    const effectivePrice = getEffectiveProductPrice(product);
    const effectiveOriginalPrice = isDiscountActive ? product.original_price : 0;
    const isStockLimitReached =
        typeof product.stock === "number" && qtyOfOtherVariants + Math.max(1, quantity) > product.stock;

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
                                price={effectivePrice}
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
                            isAddingToCart={isAddingToCart}
                            isStockLimitReached={isStockLimitReached}
                            isSelectedVariantInCart={!!selectedVariantCartItem}
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
