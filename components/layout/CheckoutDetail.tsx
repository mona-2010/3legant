"use client";

import { useForm } from "react-hook-form";
import { CartItem } from "@/components/layout/ShoppingCart";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
interface Props {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  updateQuantity: (id: number, type: "inc" | "dec") => void;
  onValidSubmit: () => void;
  removeItem: (id: number) => void;
}

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  country: string;
  payment: "card" | "paypal";
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
};

const CheckoutDetail = ({
  cartItems,
  subtotal,
  shippingCost,
  total,
  onValidSubmit,
  removeItem,
  updateQuantity
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const payment = watch("payment");

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} noValidate>
      <div className="flex flex-col lg:flex-row gap-10 px-6 my-10 mx-[30px] lg:mx-[140px] items-start">

        <div className="w-full lg:w-2/3">

          <div className="border rounded p-5 mb-6">
            <h1 className="font-medium mb-5 text-[20px]">
              Contact Information
            </h1>

            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-gray-200 font-medium mb-1">
                  First Name *
                </label>
                <input
                  {...register("firstName", { required: "First name required" })}
                  className="border rounded p-2 px-3 w-full"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-gray-200 font-medium mb-1">
                  Last Name *
                </label>
                <input
                  {...register("lastName", { required: "Last name required" })}
                  className="border rounded p-2 px-3 w-full"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-gray-200 font-medium mb-1">
                Phone Number *
              </label>
              <input
                {...register("phone", { required: "Phone required" })}
                className="border rounded p-2 px-3"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-gray-200 font-medium mb-1">
                Email Address *
              </label>
              <input
                {...register("email", {
                  required: "Email required",
                  pattern: {
                    value: /^\S+@\S+$/,
                    message: "Invalid email",
                  },
                })}
                className="border rounded p-2 px-3"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="border rounded p-5 mb-6">
            <h1 className="font-medium mb-5 text-[20px]">
              Shipping Address
            </h1>

            <div className="flex flex-col">
              <label className="text-gray-200 font-medium mb-1">
                Street Address *
              </label>
              <input
                {...register("street", { required: "Street required" })}
                className="border rounded p-2 px-3"
              />
              {errors.street && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-gray-200 font-medium mb-1">
                Town / City *
              </label>
              <input
                {...register("city", { required: "City required" })}
                className="border rounded p-2 px-3"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-gray-200 font-medium mb-1">
                Country *
              </label>
              <select
                {...register("country", { required: "Country required" })}
                className="border rounded p-2 px-3"
              >
                <option value="">Country</option>
                <option value="india">India</option>
                <option value="usa">USA</option>
              </select>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          <div className="border rounded p-5">
            <h1 className="font-medium mb-5 text-[20px]">Payment</h1>

            <div className="flex gap-2 items-center border p-3 rounded">
              <input
                type="radio"
                value="card"
                {...register("payment", { required: "Select payment method" })}
              />
              Pay by Card Credit
            </div>

            <div className="flex gap-2 items-center border p-3 rounded mt-3">
              <input type="radio" value="paypal" {...register("payment")} />
              Paypal
            </div>

            {errors.payment && (
              <p className="text-red-500 text-sm mt-2">
                {errors.payment.message}
              </p>
            )}

            {payment === "card" && (
              <>
                <hr className="my-6" />

                <input
                  {...register("cardNumber", {
                    required: "Card number required",
                  })}
                  placeholder="1234 1234 1234 1234"
                  className="border rounded p-2 w-full mb-3"
                />

                <div className="flex gap-4">
                  <input
                    {...register("expiry", { required: "Expiry required" })}
                    placeholder="MM/YY"
                    className="border rounded p-2 w-full"
                  />
                  <input
                    {...register("cvc", { required: "CVC required" })}
                    placeholder="CVC"
                    className="border rounded p-2 w-full"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="bg-black text-white py-3 mt-6 w-full rounded-lg"
            >
              Place Order
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <aside className="border rounded p-5 sticky top-10">
            <h1 className="pb-4 font-semibold text-lg">Order Summary</h1>

            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center pl-6">
                  <Image alt={item.name} src={item.image} className="w-20 h-20 object-cover" />

                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-400 text-sm">
                      Color: {item.color}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 text-[14px] hover:text-red-500 transition" >
                      <RxCross2 />
                    </button>
                    <div className="border flex w-fit px-3 py-1 rounded">
                      <button onClick={() => updateQuantity(item.id, "dec")}>-</button>
                      <span className="px-4">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, "inc")}>+</button>
                    </div>
                  </div>
                </div>



                <div className="text-center">
                  ${item.price}
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
    </form>
  );
};

export default CheckoutDetail;