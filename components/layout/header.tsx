"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiAccountCircleLine, RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { TbShoppingBag } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import NavLink from "./NavLink";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import CartPopup from "./MiniCart";
import { GoHeart } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import { IoLogoInstagram } from "react-icons/io5";
import { SlSocialFacebook } from "react-icons/sl";
import { FiYoutube } from "react-icons/fi";
import SearchModal from "./SearchModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCart } from "@/lib/cart/fetchCart";
import { clearCart, setCart } from "@/store/cartSlice";
import { useAuth } from "@/components/providers/AuthProvider";
import TintedProductImage from "./TintedProductImage";
import { clearWishlistState, fetchWishlist } from "@/store/wishlistSlice";
import { categoryFilters, getCategoryLabel } from "./FilterBar";
import { getEffectiveProductPrice } from "@/lib/utils/product-pricing";

interface SearchProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  valid_until?: string | null;
  image: string;
  color?: string[];
}

const Header = () => {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, role } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState<SearchProduct[]>([]);
  const mobileSearchRequestSeqRef = useRef(0);
  const lastMobileSearchQueryRef = useRef("");

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartQuantityCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.productIds.length);

  useEffect(() => {
    if (!menuOpen) {
      setMobileSearchQuery("");
      setMobileSearchResults([]);
    }
    document.body.style.overflow = menuOpen || cartOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    const trimmed = mobileSearchQuery.trim();

    if (!trimmed) {
      setMobileSearchResults([]);
      lastMobileSearchQueryRef.current = "";
      return;
    }

    const timer = setTimeout(async () => {
      if (lastMobileSearchQueryRef.current === trimmed) return;

      const requestId = ++mobileSearchRequestSeqRef.current;
      const { data } = await supabase
        .from("products")
        .select("id,title,price,original_price,valid_until,image,color")
        .ilike("title", `%${trimmed}%`)
        .limit(4);

      if (requestId !== mobileSearchRequestSeqRef.current) return;
      lastMobileSearchQueryRef.current = trimmed;
      const normalized = ((data as SearchProduct[]) || []).map((product) => ({
        ...product,
        price: getEffectiveProductPrice(product),
      }));
      setMobileSearchResults(normalized);
    }, 300);

    return () => clearTimeout(timer);
  }, [mobileSearchQuery, supabase]);

  useEffect(() => {
    const userId = user?.id;

    const syncCart = async () => {
      if (!userId) {
        dispatch(clearCart());
        dispatch(clearWishlistState());
        return;
      }

      const items = await fetchCart(userId);
      dispatch(setCart(items));
      dispatch(fetchWishlist({ userId }));
    };

    void syncCart();
  }, [dispatch, user?.id]);

  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  //   router.push("/");
  // };

  return (
    <>
      <div className="sticky top-0 px-[30px] md:px-[50px] lg:px-[80px] xl:px-[140px] h-[60px] flex items-center justify-between bg-white z-50">
        <div className="flex items-center">
          <GiHamburgerMenu
            className="md:hidden text-[22px] cursor-pointer"
            onClick={() => setMenuOpen(true)}
          />

          <Link href="/" className="text-[24px] font-poppins font-medium ml-5 md:mx-0">
            3legant.
          </Link>
        </div>

        <div className="font-inter hidden md:flex md:gap-[20px] lg:gap-[40px] max-w-[50%] md:mx-auto ml-16">
          <NavLink href="/" exact>Home</NavLink>
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact-us">Contact Us</NavLink>
          {role === "admin" && (
            <NavLink href="/admin">Admin</NavLink>
          )}
        </div>

        <div className="flex items-center gap-[16px] text-[22px] relative">
          <LuSearch
            className="hidden md:block cursor-pointer"
            onClick={() => setSearchOpen(true)}
          />

          {user ? (
            <Link href="/account">
              <div
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-black text-white text-sm font-semibold cursor-pointer"
                title={user?.user_metadata?.full_name}
              >
                {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </Link>
          ) : (
            <Link href="/sign-in">
              <span className="hidden md:block cursor-pointer">
                <RiAccountCircleLine />
              </span>
            </Link>
          )}

          <div
            className="flex items-center cursor-pointer"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <TbShoppingBag size={22} />
            <span className="bg-black text-white text-[12px] w-6 h-6 rounded-full flex items-center justify-center">
              {cartQuantityCount}
            </span>
          </div>

        </div>
      </div>

      <CartPopup
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
      />

      <div
        className={`fixed overflow-y-auto top-0 left-0 h-screen w-[90%] max-w-[320px] bg-white 
        z-[100] shadow-lg transform transition-transform duration-300 
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h1 className="font-poppins text-[20px] font-medium">3legant.</h1>

            <RxCross2
              className="text-[24px] cursor-pointer"
              onClick={() => setMenuOpen(false)}
            />
          </div>

          <div
            className="flex gap-3 border rounded-md p-2 items-center"
          >
            <LuSearch size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="outline-none w-full"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="py-2 px-6 relative flex flex-col h-full justify-between text-[16px]">
          {mobileSearchQuery && (
            <div className="absolute inset-0 z-10 bg-white px-6 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Search Results</h3>
                {mobileSearchResults.length > 0 ? (
                  mobileSearchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={() => {
                        setMenuOpen(false);
                        setMobileSearchQuery("");
                      }}
                      className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-xl border border-transparent hover:border-gray-100 transition-all"
                    >
                      <div className="relative w-[60px] h-[60px] bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <TintedProductImage
                          src={product.image}
                          alt={product.title}
                          fill
                          colorHex={product.color?.[0]}
                          className="object-contain p-1"
                          sizes="60px"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="font-medium text-sm text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-sm font-semibold text-black">${product.price}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No products found for "{mobileSearchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-5">
            <Link href="/" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">Home</Link>
            <div className="border-b pb-3 border-lightgray flex flex-col">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
              >
                <span>Shop</span>
                <span className="text-xl text-gray-500">{shopDropdownOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine /> }</span>
              </div>
              {shopDropdownOpen && (
                <div className="flex flex-col gap-4 pl-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                  {categoryFilters.map((category) => (
                    <Link
                      key={category}
                      href={`/shop${category !== "all" ? `?category=${category}` : ""}`}
                      onClick={() => setMenuOpen(false)}
                      className="text-gray-500 hover:text-black text-[15px]"
                    >
                      {getCategoryLabel(category)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">Blog</Link>
            <Link href="/contact-us" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">Contact Us</Link>
          </div>

          <div className="flex flex-col">
            <div className="pt-6 flex flex-col gap-4">
              <div
                className="flex items-center justify-between cursor-pointer border-b pb-3 border-lightgray"
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(true);
                }}
              >
                Cart
                <div className="flex items-center">
                  <TbShoppingBag size={25} />
                  <span className="bg-black text-white text-[12px] w-5 h-5 rounded-full flex items-center justify-center">
                    {cartQuantityCount}
                  </span>
                </div>
              </div>

              <Link
                href="/account/wishlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between cursor-pointer border-b pb-3 border-lightgray"
              >
                Wishlist
                <div className="flex items-center gap-0.5">
                  <GoHeart size={22} />
                  <span className="bg-black text-white text-[12px] w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                </div>
              </Link>
            </div>

            <div className="pt-6 flex flex-col gap-4 text-center">
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="bg-black text-white py-2 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {user ? (
                <Link href="/account"
                  className="bg-black text-white py-2 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  My Account
                </Link>
              ) : (
                <Link href="/sign-in">
                  <button className="bg-black text-white px-2 py-2 rounded-md w-full text-center">
                    Sign In
                  </button>
                </Link>
              )}
            </div>

            <div className="flex gap-2 m-4">
              <IoLogoInstagram size={30} />
              <SlSocialFacebook size={30} />
              <FiYoutube size={30} />
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <SearchModal open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
};

export default Header;