// import { RiCoupon4Line } from "react-icons/ri";
// import { RxCross2 } from "react-icons/rx";
// import Image, { StaticImageData } from "next/image";

// export type CartItem = {
//     id: number;
//     name: string;
//     color: string;
//     price: number;
//     quantity: number;
//     image: StaticImageData;
// };

// type Props = {
//   cartItems: CartItem[];
//   updateQuantity: (id: number, type: "inc" | "dec") => void;
//   subtotal: number;
//   shippingCost: number;
//   setShippingCost: (v: number) => void;
//   total: number;
//   onCheckout: () => void;
//   removeItem: (id: number) => void;
// };

// export default function ShoppingCart({
//   cartItems,
//   updateQuantity,
//   subtotal,
//   shippingCost,
//   setShippingCost,
//   total,
//   onCheckout,
//   removeItem,

// }: Props) {
//   const shippingOptions = [
//     { id: 1, name: "Free Shipping", price: 0 },
//     { id: 2, name: "Express Shipping", price: 15 },
//     { id: 3, name: "Pickup (21%)", price: subtotal * 0.21 },
//   ];


//   return (
//     <>
//       <div className="grid grid-cols-3 gap-15 px-30">
//         <div className="col-span-2">
//           <div className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b text-gray-500 py-4 font-medium">
//             <div className="pl-6">Product</div>
//             <div className="text-center">Quantity</div>
//             <div className="text-center">Price</div>
//             <div className="text-right pr-6">Subtotal</div>
//           </div>

//           {cartItems.map((item) => (
//             <div
//               key={item.id}
//               className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b py-6 items-center"
//             >

//               <div className="flex gap-4 items-center pl-6">
//                 <Image src={item.image} alt={item.name} className="w-20 h-20 object-cover" />

//                 <div>
//                   <p className="font-semibold">{item.name}</p>
//                   <p className="text-gray-400 text-sm">
//                     Color: {item.color}
//                   </p>

//                   <button
//                     onClick={() => removeItem(item.id)}
//                     className="flex gap-1 items-center text-gray-400 text-[14px] hover:text-black transition"
//                   >
//                     <RxCross2 />
//                     Remove
//                   </button>
//                 </div>
//               </div>

//               <div className="flex justify-center">
//                 <div className="border flex w-fit px-3 py-1 rounded">
//                   <button onClick={() => updateQuantity(item.id, "dec")}>-</button>
//                   <span className="px-4">{item.quantity}</span>
//                   <button onClick={() => updateQuantity(item.id, "inc")}>+</button>
//                 </div>
//               </div>

//               <div className="text-center">
//                 ${item.price}
//               </div>

//               <div className="font-semibold text-right pr-6">
//                 ${(item.price * item.quantity).toFixed(2)}
//               </div>

//             </div>
//           ))}
//         </div>

//         <aside className="border p-6 rounded-lg h-fit lg:sticky lg:top-24">
//           <h2 className="font-semibold text-lg mb-6">
//             Cart Summary
//           </h2>

//           <div className="space-y-3">
//             {shippingOptions.map((option) => (
//               <label
//                 key={option.id}
//                 className="flex justify-between items-center border p-3 rounded cursor-pointer"
//               >
//                 <div className="flex items-center gap-1">
//                   <input
//                     type="radio"
//                     name="shipping"
//                     onChange={() => setShippingCost(option.price)}
//                   />
//                   <span>{option.name}</span>
//                 </div>

//                 <span className="font-medium">
//                   {option.price === 0
//                     ? "Free"
//                     : `+$${option.price.toFixed(2)}`}
//                 </span>
//               </label>
//             ))}
//           </div>

//           <div className="space-y-3 border-t pt-6 mt-6">
//             <div className="flex justify-between">
//               <span>Subtotal</span>
//               <span>${subtotal.toFixed(2)}</span>
//             </div>

//             <div className="flex justify-between">
//               <span>Shipping</span>
//               <span>${shippingCost.toFixed(2)}</span>
//             </div>

//             <div className="flex justify-between font-bold text-lg">
//               <span>Total</span>
//               <span>${total.toFixed(2)}</span>
//             </div>
//           </div>
//           <button className="bg-black text-white w-full py-3 mt-6" onClick={onCheckout}>
//             Checkout
//           </button>
//         </aside>

//       </div>
//        <div className="mx-[140px] my-10 leading-9">
//         <h1 className="font-medium font-semibold text-[21px]">Have a coupon?</h1>
//         <h2 className="text-gray-200 text-[16px]">Add your code for an instant cart discount</h2>
//         <div className="flex border w-fit px-3 my-3 gap-25 border-gray-200">
//           <div className="flex items-center gap-2">
//             <RiCoupon4Line />
//             <input placeholder="Coupon Code" className="py-2 focus:outline-none" />
//           </div>
//           <button>Apply</button>
//         </div>
//       </div>
//       </>
//   );
// }
"use client"

import { RiCoupon4Line } from "react-icons/ri"
import { RxCross2 } from "react-icons/rx"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { setShippingMethod } from "@/store/cartSlice"
import { CartItem } from "@/types/cart"

interface Props {
  cartItems: CartItem[]
  updateQuantity: (id: string, type: "inc" | "dec") => Promise<void>
  subtotal: number
  shippingCost: number
  total: number
  onCheckout: () => void
  removeItem: (id: string) => Promise<void>
}

export default function ShoppingCart({
  cartItems,
  updateQuantity,
  subtotal,
  shippingCost,
  total,
  onCheckout,
  removeItem
}: Props) {

  const dispatch = useDispatch()
  const shippingMethod = useSelector(
    (state: RootState) => state.cart.shippingMethod
  )

  const shippingOptions: {
    id: number
    name: string
    method: "free" | "express" | "pickup"
  }[] = [
    { id: 1, name: "Free Shipping", method: "free" },
    { id: 2, name: "Express Shipping", method: "express" },
    { id: 3, name: "Pickup (21%)", method: "pickup" }
  ]

  return (
    <>
      <div className="grid grid-cols-3 gap-15 px-30">

        <div className="col-span-2">

          <div className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b text-gray-500 py-4 font-medium">
            <div>Product</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Price</div>
            <div className="text-right">Subtotal</div>
          </div>

          {cartItems.map(item => (

            <div
              key={item.id}
              className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b py-6 items-center"
            >

              <div className="flex gap-4 items-center">

                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                />

                <div>

                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Color: {item.color}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex gap-1 items-center text-gray-400 text-[14px] hover:text-black transition"
                  >
                    <RxCross2 />
                    Remove
                  </button>

                </div>

              </div>

              <div className="flex justify-center">

                <div className="border flex w-fit px-3 py-1 rounded">

                  <button onClick={() => updateQuantity(item.id,"dec")}>
                    -
                  </button>

                  <span className="px-4">
                    {item.quantity}
                  </span>

                  <button onClick={() => updateQuantity(item.id,"inc")}>
                    +
                  </button>

                </div>

              </div>

              <div className="text-center">
                ${item.price}
              </div>

              <div className="text-right font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

            </div>

          ))}

        </div>

        {/* CART SUMMARY */}

        <aside className="border p-6 rounded-lg h-fit lg:sticky lg:top-24">

          <h2 className="font-semibold text-lg mb-6">
            Cart Summary
          </h2>

          {/* SHIPPING OPTIONS */}

          <div className="space-y-3">

            {shippingOptions.map(option => (

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

                  <span>{option.name}</span>

                </div>

              </label>

            ))}

          </div>

          {/* TOTALS */}

          <div className="space-y-3 border-t pt-6 mt-6">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

          </div>

          {/* CHECKOUT */}

          <button
            className="bg-black text-white w-full py-3 mt-6"
            onClick={onCheckout}
          >
            Checkout
          </button>

        </aside>

      </div>

      {/* COUPON */}

      <div className="mx-[140px] my-10 leading-9">

        <h1 className="font-medium text-[21px]">
          Have a coupon?
        </h1>

        <div className="flex border w-fit px-3 my-3 gap-25 border-gray-200">

          <div className="flex items-center gap-2">

            <RiCoupon4Line />

            <input
              placeholder="Coupon Code"
              className="py-2 focus:outline-none"
            />

          </div>

          <button>
            Apply
          </button>

        </div>

      </div>
    </>
  )
}