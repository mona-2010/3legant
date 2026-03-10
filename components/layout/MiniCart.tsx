"use client";

import Link from "next/link";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import { TbShoppingBag } from "react-icons/tb";
import { CartItem } from "@/app/cart/page";
import React from "react";

interface CartPopupProps {
  cartItems: CartItem[];
  updateQuantity: (id: number, type: "inc" | "dec") => void;
  removeItem: (id: number) => void;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartPopup: React.FC<CartPopupProps> = ({
  cartItems,
  updateQuantity,
  removeItem,
  cartOpen,
  setCartOpen,
}) => {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90]"
          onClick={() => setCartOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-[400px] bg-white z-[100] shadow-[-5px_0_15px_rgba(0,0,0,0.05)] transform transition-transform duration-300 flex flex-col
          ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-[24px] font-medium font-poppins">Cart</h2>
            <RxCross2
              className="text-[24px] cursor-pointer"
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              role="button"
              tabIndex={0}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-6">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 border-b border-lightgray pb-6 last:border-b-0"
                >
                  <div className="w-[80px] h-[96px] bg-gray-100 flex-shrink-0 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fill
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[14px] font-medium text-black">
                          {item.name}
                        </h3>
                        <p className="text-[12px] text-gray-500 mt-1">
                          Color: {item.color}
                        </p>
                      </div>
                      <p className="text-[14px] font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border rounded-md px-3 py-1 w-max">
                        <button
                          onClick={() => updateQuantity(item.id, "dec")}
                          className="text-gray-500 hover:text-black"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="mx-4 text-[14px]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, "inc")}
                          className="text-gray-500 hover:text-black"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <RxCross2
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 cursor-pointer hover:text-black"
                        aria-label={`Remove ${item.name} from cart`}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 mt-auto">
            <div className="flex justify-between text-[14px] mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[20px] font-medium mb-6">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-lg font-medium text-[16px] hover:bg-gray-800 transition-colors">
              <Link href="/checkout">Checkout</Link>
            </button>

            <div className="mt-4 text-center">
              <Link
                href="/cart"
                className="text-[14px] font-medium border-b border-black pb-[1px]"
                onClick={() => setCartOpen(false)}
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
    </>
  );
};

export default CartPopup;