const orders = [
  {
    id: "#3456_768",
    date: "October 17, 2023",
    status: "Delivered",
    price: "$1234.00",
  },
  {
    id: "#3456_980",
    date: "October 11, 2023",
    status: "Pending",
    price: "$345.00",
  },
  {
    id: "#3456_120",
    date: "August 24, 2023",
    status: "Out for Delivery",
    price: "$2345.00",
  },
  {
    id: "#3456_030",
    date: "August 12, 2023",
    status: "Delivered",
    price: "$845.00",
  },
]

const OrdersPage = () => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="text-left py-4">Number ID</th>
            <th className="text-left py-4">Dates</th>
            <th className="text-left py-4">Status</th>
            <th className="text-left py-4">Price</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b text-sm">
              <td className="py-4">{order.id}</td>
              <td className="py-4">{order.date}</td>
              <td className="py-4">{order.status}</td>
              <td className="py-4">{order.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersPage