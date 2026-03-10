"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiAccountCircleLine } from "react-icons/ri";
import { TbShoppingBag } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import NavLink from "./NavLink";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import CartPopup from "./MiniCart";
import { initialCartItems } from "@/app/cart/page";
import { GoHeart } from "react-icons/go";
import { LuSearch } from "react-icons/lu";
import { IoLogoInstagram } from "react-icons/io5";
import { SlSocialFacebook } from "react-icons/sl";
import { FiYoutube } from "react-icons/fi";
import SearchModal from "./SearchModal";

const Header = () => {
  const supabase = createClient();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const updateQuantity = (id: number, type: "inc" | "dec") => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + (type === "inc" ? 1 : -1)) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="relative px-6 md:px-[80px] lg:px-[140px] h-[60px] flex items-center justify-between bg-white z-[50]">
        <div className="flex items-center">
          <GiHamburgerMenu
            className="md:hidden text-[22px] cursor-pointer"
            onClick={() => setMenuOpen(true)}
          />
          <Link href="/" className="text-[24px] font-poppins font-medium ml-5 md:mx-0">
            3legant.
          </Link>
        </div>

        <div className="font-inter hidden md:flex gap-[40px] max-w-[50%] md:mx-auto ml-16">
          <NavLink href="/" exact>Home</NavLink>
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/product">Product</NavLink>
          <NavLink href="/contact-us">Contact Us</NavLink>
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
                title={user.display_name}
              >
                {user.user_metadata.full_name?.charAt(0).toUpperCase() || "U"}
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
            role="button"
            tabIndex={0}
          >
            <TbShoppingBag size={22} />
            <span className="bg-black text-white text-[12px] w-7 h-7 rounded-full flex items-center justify-center">
              {cartItems.length}
            </span>
          </div>
        </div>
      </div>

      <CartPopup
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
      />

      <div
        className={`fixed top-0 left-0 h-screen w-[90%] max-w-[320px] bg-white 
        z-[100] shadow-lg transform transition-transform duration-300 
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center"><h1 className="font-poppins text-[20px] font-medium">3legant.</h1>
            <RxCross2
              className="text-[24px] cursor-pointer"
              onClick={() => setMenuOpen(false)}
            />
          </div>
          <div
            className="flex gap-3 border rounded-md p-2 items-center cursor-pointer"
            onClick={() => {
              setMenuOpen(false)
              setSearchOpen(true)
            }}
          >
            <LuSearch
              size={20}
              onClick={() => {
                setMenuOpen(false)
                setSearchOpen(true)
              }}
            />
            <input
              type="text"
              placeholder="Search"
              className="outline-none w-full"
              readOnly
            />
          </div>
        </div>

        <div className="p-6 flex flex-col h-[calc(100%-120px)] justify-between text-[16px]">
          <div className="flex flex-col gap-5">
            <Link href="/" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">Shop</Link>
            <Link href="/product" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">Product</Link>
            <Link href="/contact-us" onClick={() => setMenuOpen(false)} className="border-b pb-3 border-lightgray">
              Contact Us
            </Link>
          </div>
          <div className="flex flex-col">
            <div className="pt-6 flex flex-col gap-4">
              <p
                className="flex items-center justify-between cursor-pointer border-b pb-3 border-lightgray"
                onClick={() => {
                  setMenuOpen(false)
                  setCartOpen(true)
                }}> Cart <TbShoppingBag size={25} /></p>
              <p className="flex items-center justify-between cursor-pointer border-b pb-3 border-lightgray">Wishlist <GoHeart size={25} /></p>
            </div>

            <div className="pt-6 flex flex-col gap-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-black text-white py-2 rounded-md"
                >
                  Sign Out
                </button>
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
          className="fixed inset-0 bg-black/40 z-[90] transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <SearchModal open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
};

export default Header;
