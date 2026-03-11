"use client";
import { CartItem } from "@/types/cart";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import CheckoutForm from "../forms/CheckOutForm";

type Props = {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  updateQuantity: (id: string, type: "inc" | "dec") => Promise<void>;
  onValidSubmit: () => void;
  removeItem: (id: string) => Promise<void>;
};

const CheckoutDetail = ({
  cartItems,
  subtotal,
  shippingCost,
  total,
  onValidSubmit,
  removeItem,
  updateQuantity,
}: Props) => {
  return (
    <div className="font-inter flex flex-col lg:flex-row gap-10 px-6 my-10 mx-[30px] lg:mx-[140px] items-start">
      <CheckoutForm onValidSubmit={onValidSubmit} />
      <div className="w-full lg:w-1/3">
        <aside className="border border-gray-200 rounded p-5 sticky top-10">
          <h1 className="pb-4 font-semibold text-lg">Order Summary</h1>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center mb-4"
            >
              <div className="flex gap-3 items-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={90}
                  height={90}
                  className="object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-sm mt-2 text-gray-400">
                    Color: {item.color}
                  </p>
                  <div className="border border-gray-200 flex items-center w-fit my-2 px-3 py-1 rounded">
                    <button onClick={() => updateQuantity(item.id, "dec")}>
                      -
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, "inc")}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <RxCross2
                  className="cursor-pointer text-gray-400"
                  onClick={() => removeItem(item.id)}
                />
              </div>
            </div>
          ))}

          <hr className="my-4" />
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 mt-2">
            <span>Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mt-4">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutDetail;