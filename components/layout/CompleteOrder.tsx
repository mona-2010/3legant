import { MdCelebration } from "react-icons/md";

type Props = { total: number };

export default function CompleteOrder({ total }: Props) {
  return (
    <div className="text-center my-20">
      <h1 className="flex justify-center text-gray-500 text-2xl">Thank you <MdCelebration /></h1>
      <h2 className="font-poppins text-4xl font-semibold">Your Order has been Received</h2>

      <div className="text-gray-500 my-6">
        <p>Order Code: #{Math.floor(Math.random() * 100000)}</p>
        <p>Date: {new Date().toLocaleDateString()}</p>
        <p>Total: ${total}</p>
      </div>

      <button className="bg-black text-white px-10 py-4 rounded-full">
        Purchase History
      </button>
    </div>
  );
}