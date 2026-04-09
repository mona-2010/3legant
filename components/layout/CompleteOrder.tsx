import Link from "next/link";
import { Order, OrderItem } from "@/types";
import TintedProductImage from "./TintedProductImage";

type Props = { total: number; order?: Order | null; orderItems?: OrderItem[] };

export default function CompleteOrder({ total, order, orderItems = [] }: Props) {
  const orderCode = order ? `#${order.id.slice(0, 4)}_${order.id.slice(4, 9)}` : `#${Math.floor(Math.random() * 100000)}`;
  const orderDate = order
    ? new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const orderTotal = order ? order.total_price : total;
  const paymentMethod = order?.payment_method === "paypal" ? "Paypal" : "Credit Card";

  return (
    <div className="flex flex-col items-center my-10 md:my-16 px-4">
      <p className="text-gray-400 text-xl font-inter">Thank you! 🎉</p>
      <h1 className="font-poppins text-3xl md:text-[40px] font-semibold mt-2 text-center leading-tight">
        Your order has been<br />received
      </h1>

      {orderItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          {orderItems.map((item) => (
            <div key={item.id} className="relative w-[100px] h-[100px]">
              {item.product_image && (
                <TintedProductImage
                  src={item.product_image}
                  alt={item.product_title || "Product"}
                  fill
                  colorHex={item.product_color}
                  className="object-fit mix-blend-hue rounded-sm opacity-100"
                />
              )}
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                {item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 space-y-4 text-[15px]">
        <div className="flex gap-10">
          <span className="text-gray-400 w-36">Order code:</span>
          <span className="font-semibold">{orderCode}</span>
        </div>
        <div className="flex gap-10">
          <span className="text-gray-400 w-36">Date:</span>
          <span className="font-semibold">{orderDate}</span>
        </div>
        <div className="flex gap-10">
          <span className="text-gray-400 w-36">Total:</span>
          <span className="font-semibold">${orderTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-10">
          <span className="text-gray-400 w-36">Payment method:</span>
          <span className="font-semibold">{paymentMethod}</span>
        </div>
      </div>

      <Link
        href="/account/orders"
        className="mt-10 bg-black text-white px-10 py-4 rounded-full text-sm font-medium"
      >
        Purchase history
      </Link>
    </div>
  );
}