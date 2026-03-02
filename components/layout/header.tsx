
"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { GiHamburgerMenu } from "react-icons/gi"
import { RiAccountCircleLine, RiSearchLine } from "react-icons/ri"
import { TbShoppingBag } from "react-icons/tb"
import { RxCross2 } from "react-icons/rx"
import NavLink from "./NavLink"

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [menuOpen])

  return (
    <>
      <div className="relative px-6 md:px-[80px] lg:px-[140px] h-[60px] flex items-center justify-between">
        <div className="flex items-center ">
          <GiHamburgerMenu
            className="md:hidden text-[22px] cursor-pointer"
            onClick={() => setMenuOpen(true)}
          /> <h1 className="text-[24px] font-poppins font-medium ml-5 md:mx-0">
          3legant.
        </h1>
        </div>

        <div className="hidden md:flex gap-[40px] max-w-[50%] md:mx-auto ml-16">
          <NavLink href="/" exact>Home</NavLink>
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/product">Product</NavLink>
          <NavLink href="/contact-us">Contact Us</NavLink>
        </div>
        <div className="flex items-center gap-[16px] text-[22px]">
          <RiSearchLine className="hidden md:block cursor-pointer" />
          <Link href="/sign-up"><RiAccountCircleLine className="hidden md:block cursor-pointer" /></Link>

          <Link href="/product" className="relative cursor-pointer">
            <TbShoppingBag />
          </Link>
        </div>
      </div>
      <div
        className={`fixed top-0 left-0 h-full w-[90%] max-w-[320px] bg-white 
        z-[100] shadow-lg transform transition-transform duration-300 
        overflow-y-auto
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex justify-between items-center border-b">
          <h1 className="text-[20px] font-medium">3legant.</h1>
          <RxCross2
            className="text-[24px] cursor-pointer"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        <div className="p-6 flex flex-col gap-6 text-[16px]">
          <input
            type="text"
            placeholder="Search"
            className="border px-3 py-2 rounded-md outline-none"
          />

          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/product" onClick={() => setMenuOpen(false)}>Product</Link>
          <Link href="/contact-us" onClick={() => setMenuOpen(false)}>
            Contact Us
          </Link>

          <div className="border-t pt-6 flex flex-col gap-4">
            <p>Cart (2)</p>
            <p>Wishlist (2)</p>

            <button className="bg-black text-white py-2 rounded-md">
              Sign In
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90]"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Header