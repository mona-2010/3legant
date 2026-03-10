// "use client";
// import { useEffect, useState } from "react";
// import Breadcrumb from "@/components/BreadCrumb";
// import { Header, NavigationHeader } from "@/components/dynamicComponents";
// import Footer from "@/components/layout/Footer";
// import Newsletter from "@/components/layout/NewsLetter";
// import ProductReviews from "@/components/layout/ProductReview";
// import ProductCarousel from "@/components/layout/ProductCarousel";
// import ProductImageGallery from "@/components/layout/ProductImagegallery";
// import { GoHeart } from "react-icons/go";
// import Link from "next/link";
// import color1 from "@/app/assets/images/prodslider-1.png";
// import color2 from "@/app/assets/images/prodslider-1.png";
// import color3 from "@/app/assets/images/prodslider-1.png";
// import color4 from "@/app/assets/images/prodslider-1.png";
// import productdetail from "@/app/assets/images/productdetail.png";
// import prodslider1 from "@/app/assets/images/prodslider-1.png";
// import prodslider2 from "@/app/assets/images/prodslider-2.png";
// import prodslider3 from "@/app/assets/images/prodslider-3.png";
// import { StarRating } from "@/components/layout/ProductSlider";
// import Image from "next/image";

// type Product = {
//     id: number;
//     name: string;
//     description: string;
//     price: number;
//     oldprice: number;
//     sku: number;
//     category: string;
//     validUntil: number;
// };

// const product: Product = {
//     id: 1,
//     name: "Tray Table",
//     description:
//         "Buy one or buy a few and make every space where you sit more convenient. Light and easy to move around with removable tray top, handy for serving snacks.",
//     price: 199,
//     oldprice: 400,
//     sku: 123,
//     category: "Bedroom",
//     validUntil: 1775865600,
// };

// const productImages = [
//     productdetail,
//     prodslider1,
//     prodslider2,
//     prodslider3,
// ];

// export default function ProductDetailPage() {
//     const colors = [color1, color2, color3, color4];
//     const [selectedColor, setSelectedColor] = useState(0);
//     const [quantity, setQuantity] = useState(1);
//     const [timeLeft, setTimeLeft] = useState({
//         days: 0,
//         hours: 0,
//         minutes: 0,
//         seconds: 0,
//     });

//     const updateQuantity = (type: "inc" | "dec") => {
//         setQuantity((prev) => (type === "inc" ? prev + 1 : Math.max(1, prev - 1)));
//     };

//     useEffect(() => {
//         const targetDate = product.validUntil * 1000;
//         const interval = setInterval(() => {
//             const now = Date.now();
//             const diff = targetDate - now;

//             if (diff <= 0) {
//                 clearInterval(interval);
//                 return;
//             }

//             setTimeLeft({
//                 days: Math.floor(diff / (1000 * 60 * 60 * 24)),
//                 hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
//                 minutes: Math.floor((diff / (1000 * 60)) % 60),
//                 seconds: Math.floor((diff / 1000) % 60),
//             });
//         }, 1000);

//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <div>
//             <NavigationHeader />
//             <Header />

//             <div className="mx-[30px] md:mx-[50px] lg:mx-[140px]">
//                 <div className="my-[16px]">
//                     <Breadcrumb
//                         currentPage={product.name}
//                         crumbs={[
//                             { title: "Shop", href: "/shop" },
//                             {
//                                 title: product.category,
//                                 href: `/shop?category=${product.category?.[0]}`
//                             }
//                         ]}
//                     />
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-15">
//                     <div className="flex flex-col gap-1 md:w-1/2">
//                         <ProductImageGallery images={productImages} />
//                     </div>
//                     <div className="md:w-1/2 flex flex-col gap-4">

//                         <div className="flex items-center gap-2">
//                             <StarRating rating={4.5} />
//                             <p>11 Reviews</p>
//                         </div>

//                         <h1 className="font-poppins text-[40px]">{product.name}</h1>

//                         <p className="text-gray-200 w-[90%] leading-[26px]">
//                             {product.description}
//                         </p>

//                         <div className="flex items-center gap-3 font-poppins font-[500]">
//                             <p className="text-[28px]">${product.price}</p>
//                             <p className="text-[20px] text-gray-200 line-through">
//                                 ${product.oldprice}
//                             </p>
//                         </div>

//                         <div className="border-y py-5 border-lightgray">
//                             <p>Offer expires in:</p>
//                             <div className="flex gap-3 py-6">
//                                 {Object.entries(timeLeft).map(([label, value]) => (
//                                     <div key={label} className="flex flex-col items-center">
//                                         <span className="bg-gray-100 px-5 py-2 text-3xl font-semibold">
//                                             {value.toString().padStart(2, "0")}
//                                         </span>
//                                         <span className="text-xs text-gray-400 uppercase">
//                                             {label}
//                                         </span>
//                                     </div>
//                                 ))}

//                             </div>
//                         </div>
//                         <div className="flex flex-col gap-2 py-4 border-b border-lightgray">
//                             <p className="text-gray-200 text-[16px] font-semibold">Choose a color</p>
//                             <p className="text-sm text-gray-500">
//                                 {["Black", "White", "Grey", "Oak"][selectedColor]}
//                             </p>
//                             <div className="flex gap-3 mt-2">
//                                 {colors.map((color, index) => (
//                                     <button
//                                         key={index}
//                                         onClick={() => setSelectedColor(index)}
//                                         className={`relative w-[72px] h-[72px] rounded-sm overflow-hidden border ${selectedColor === index ? "border-black" : "border-transparent"}`}
//                                     >
//                                         <Image
//                                             src={color}
//                                             alt={`color-${index}`}
//                                             className="object-cover"
//                                             sizes="72px"
//                                         />
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="flex flex-col md:flex-row items-center gap-6">
//                             <div className="bg-[#F5F5F5] flex items-center px-10 py-3">
//                                 <button onClick={() => updateQuantity("dec")}>-</button>
//                                 <span className="px-6">{quantity}</span>
//                                 <button onClick={() => updateQuantity("inc")}>+</button>
//                             </div>

//                             <button className="border-2 rounded-lg w-full py-3 flex items-center justify-center gap-2">
//                                 <GoHeart size={20} />
//                                 Wishlist
//                             </button>

//                         </div>
//                         <Link
//                             href="/cart"
//                             className="w-full rounded-lg bg-black text-white text-center py-3"
//                         >
//                             Add to cart
//                         </Link>

//                         <div className="mt-5 flex flex-col gap-2 text-gray-200 text-sm">
//                             <p className="flex gap-10 uppercase">
//                                 SKU <span className="text-black">{product.sku}</span>
//                             </p>
//                             <p className="flex gap-6 uppercase">
//                                 Category{" "}
//                                 <span className="text-black capitalize">
//                                     {product.category}
//                                 </span>
//                             </p>
//                         </div>

//                     </div>
//                 </div>

//                 <ProductReviews />
//             </div>

//             <ProductCarousel />
//             <Newsletter />
//             <Footer />
//         </div>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/BreadCrumb";
import { Header, NavigationHeader } from "@/components/dynamicComponents";
import Footer from "@/components/layout/Footer";
import Newsletter from "@/components/layout/NewsLetter";
import ProductReviews from "@/components/layout/ProductReview";
import ProductCarousel from "@/components/layout/ProductCarousel";
import ProductImageGallery from "@/components/layout/ProductImagegallery";
import { GoHeart } from "react-icons/go";
import Link from "next/link";
import { StarRating } from "@/components/layout/ProductSlider";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import color1 from "@/app/assets/images/prodslider-1.png";
import color2 from "@/app/assets/images/prodslider-1.png";
import color3 from "@/app/assets/images/prodslider-1.png";
import color4 from "@/app/assets/images/prodslider-1.png";
import prodslider1 from "@/app/assets/images/prodslider-1.png";
import prodslider2 from "@/app/assets/images/prodslider-2.png";
import prodslider3 from "@/app/assets/images/prodslider-3.png";

type Product = {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    original_price?: number;
    category: string[];
    rating: number;
    is_new?: boolean;
    sku?: number;
    validUntil?: number;
};

export default function ProductDetailPage() {
    const params = useParams();
    const supabase = createClient();

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(0);

    const colors = [color1, color2, color3, color4];

    const productImages = product
        ? [
            product.image,
            prodslider1,
            prodslider2,
            prodslider3,
        ]
        : []

    const updateQuantity = (type: "inc" | "dec") => {
        setQuantity((prev) =>
            type === "inc" ? prev + 1 : Math.max(1, prev - 1)
        );
    };

    useEffect(() => {
        const fallbackDate = new Date("2026-03-31T23:59:59").getTime();

        const targetDate = product?.validUntil
            ? product.validUntil * 1000
            : fallbackDate;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = targetDate - now;

            if (diff <= 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [product]);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", params.slug)
                .single();

            if (!error && data) setProduct(data);
        };

        fetchProduct();
    }, [params.slug]);

    if (!product) return <p className="p-10">Loading...</p>;

    return (
        <div>
            <NavigationHeader />
            <Header />

            <div className="mx-[30px] md:mx-[50px] lg:mx-[140px]">
                <div className="my-[16px]">
                    <Breadcrumb
                        currentPage={product.title}
                        crumbs={[
                            { title: "Shop", href: "/shop" },
                            {
                                title: product.category?.[0],
                                href: `/shop?category=${product.category?.[0]}`,
                            },
                        ]}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-15">
                    <div className="flex flex-col gap-1 md:w-1/2">
                        <ProductImageGallery
                            images={product.image ? [product.image, prodslider1, prodslider2, prodslider3] : []}
                            price={product.price}
                            originalPrice={product.original_price}
                            isNew={product.is_new}
                        />
                    </div>


                    <div className="md:w-1/2 flex flex-col gap-4">

                        <div className="flex items-center gap-2">
                            <StarRating rating={product.rating || 5} />
                            <p>11 Reviews</p>
                        </div>

                        <h1 className="font-poppins text-[40px]">
                            {product.title}
                        </h1>

                        <p className="text-gray-200 w-[90%] leading-[26px]">
                            {product.description}
                        </p>

                        <div className="flex items-center gap-3 font-poppins font-[500]">
                            <p className="text-[28px]">${product.price}</p>

                            {product.original_price && (
                                <p className="text-[20px] text-gray-200 line-through">
                                    ${product.original_price}
                                </p>
                            )}
                        </div>

                        <div className="border-y py-5 border-lightgray">
                            <p>Offer expires in:</p>
                            <div className="flex gap-3 py-6">
                                {Object.entries(timeLeft).map(([label, value]) => (
                                    <div key={label} className="flex flex-col items-center">
                                        <span className="bg-gray-100 px-5 py-2 text-3xl font-semibold">
                                            {value.toString().padStart(2, "0")}
                                        </span>
                                        <span className="text-xs text-gray-400 uppercase">
                                            {label}
                                        </span>
                                    </div>
                                ))}

                            </div>
                        </div>


                        <div className="flex flex-col gap-2 py-4 border-b border-lightgray">
                            <p className="text-gray-200 text-[16px] font-semibold">
                                Choose a color
                            </p>

                            <p className="text-sm text-gray-500">
                                {["Black", "White", "Grey", "Oak"][selectedColor]}
                            </p>

                            <div className="flex gap-3 mt-2">
                                {colors.map((color, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedColor(index)}
                                        className={`relative w-[72px] h-[72px] rounded-sm overflow-hidden border ${selectedColor === index
                                            ? "border-black"
                                            : "border-transparent"
                                            }`}
                                    >
                                        <Image
                                            src={color}
                                            alt={`color-${index}`}
                                            className="object-cover"
                                            sizes="72px"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>


                        <div className="flex flex-col md:flex-row items-center gap-6">

                            <div className="bg-gray-100 flex items-center px-10 py-3">
                                <button onClick={() => updateQuantity("dec")}>-</button>
                                <span className="px-6">{quantity}</span>
                                <button onClick={() => updateQuantity("inc")}>+</button>
                            </div>

                            <button className="border-2 rounded-lg w-full py-3 flex items-center justify-center gap-2">
                                <GoHeart size={20} />
                                Wishlist
                            </button>

                        </div>

                        <Link
                            href="/cart"
                            className="w-full rounded-lg bg-black text-white text-center py-3"
                        >
                            Add to cart
                        </Link>

                        <div className="mt-5 flex flex-col gap-2 text-gray-200 text-sm">

                            {product.sku && (
                                <p className="flex gap-10 uppercase">
                                    SKU <span className="text-black">{product.sku}</span>
                                </p>
                            )}

                            <p className="flex gap-6 uppercase">
                                Category
                                <span className="text-black capitalize">
                                    {product.category?.[0]}
                                </span>
                            </p>

                        </div>

                    </div>

                </div>

                <ProductReviews />

            </div>

            {/* <ProductCarousel /> */}
            <Newsletter />
            <Footer />

        </div>
    );
}