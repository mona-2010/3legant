"use client";
import { CartItem } from "@/types/index";
import { RxCross2 } from "react-icons/rx";
import CheckoutForm, { FormData } from "../forms/CheckOutForm";
import CouponInput from "./CouponInput";
import TintedProductImage from "./TintedProductImage";
import { HiMinus, HiPlus } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { setShippingMethod } from "@/store/cartSlice";
import { buildShippingOptions, getShippingOptionPriceLabel } from "@/lib/shipping";

type Props = {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  discount: number;
  total: number;
  isCartEmpty: boolean;
  appliedCouponId?: string;
  updateQuantity: (id: string, type: "inc" | "dec") => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

const CheckoutDetail = ({
  cartItems,
  subtotal,
  shippingCost,
  shippingMethod,
  discount,
  total,
  isCartEmpty,
  appliedCouponId,
  removeItem,
  updateQuantity,
}: Props) => {
  const dispatch = useDispatch()
  const shippingOptions = buildShippingOptions(["free", "express", "pickup"])
  const renderOrderSummaryContent = () => (
    <>
      <h1 className="pb-4 font-semibold text-lg">Order Summary</h1>

      <div className="max-h-[60vh] overflow-y-auto [scrollbar-gutter:stable]">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex sm:flex-row justify-between gap-3 mb-4"
          >
            <div className="flex gap-3 bg-white">
              <div className="relative w-[72px] h-[72px] sm:w-[90px] sm:h-[90px]">
                <TintedProductImage
                  src={item.image}
                  alt={item.name}
                  fill
                  colorHex={item.color}
                  className="object-fit mix-blend-multiply"
                  sizes="(min-width: 640px) 90px, 72px"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs mt-2 text-gray-400">
                  Color: {item.color || "Default"}
                </p>
                <div className="border border-gray-200 flex items-center w-fit my-2 px-3 py-1 rounded">
                  <button
                    onClick={() => updateQuantity(item.id, "dec")}
                    className="cursor-pointer"
                  >
                    <HiMinus size={12} />
                  </button>
                  <span className="px-3 text-md">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, "inc")}
                    disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                    className={typeof item.stock === "number" && item.quantity >= item.stock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  >
                    <HiPlus size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:self-auto">
              <span className="text-xs xl:text-sm font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <RxCross2 size={20}
                className="cursor-pointer text-gray-400"
                onClick={() => removeItem(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <hr className="my-4" />
      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className="flex justify-between items-center border p-3 rounded cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === option.method}
                onChange={() => dispatch(setShippingMethod(option.method))}
              />
              <span className="text-sm md:text-md">{option.name}</span>
            </div>

            <span className="text-sm md:text-md font-medium">
              {getShippingOptionPriceLabel(option.method)}
            </span>
          </label>
        ))}
      </div>

      <hr className="my-4" />
      <CouponInput subtotal={subtotal} showNotification={false} />
      <hr className="my-4" />

      <div className="flex justify-between text-gray-600">
        <span>Shipping</span>
        <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
      </div>
      <div className="flex justify-between text-gray-600 mt-2">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold text-lg mt-4">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </>
  )

  return (
    <div className="font-inter flex flex-col lg:flex-row gap-8 lg:gap-10 px-[30px] md:px-[50px] lg:px-[80px] xl:px-[140px] my-8 sm:my-10 items-start">
      <CheckoutForm
        total={total}
        subtotal={subtotal}
        discount={discount}
        shippingCost={shippingCost}
        shippingMethod={shippingMethod}
        isCartEmpty={isCartEmpty}
        cartItems={cartItems}
        appliedCouponId={appliedCouponId}
        mobileOrderSummary={
          <aside className="border border-gray-200 rounded p-4 sm:p-5">
            {renderOrderSummaryContent()}
          </aside>
        }
      />
      <div className="hidden lg:block w-full lg:w-1/3">
        <aside className="border border-gray-200 rounded p-4 sm:p-5 lg:sticky lg:top-10">
          {renderOrderSummaryContent()}
        </aside>
      </div>
    </div>
  );
};

export default CheckoutDetail;