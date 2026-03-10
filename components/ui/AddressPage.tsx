"use client"
import { useState } from "react"
import { BiEditAlt } from "react-icons/bi"

interface Address {
    id: number;
    title: string;
    address: string;
    name: string;
    phone: number;
}

const AddressPage = () => {
    const [addresses, setAddresses] = useState<Address[]>([
        { id: 1, name: "Jim Halpert", phone: 789456123, title: "Billing Address", address: "2118 Thornridge Cir. Syracuse, Stamford 35624" },
        { id: 2, name: "Pam Beesley", phone: 989456123, title: "Shipping Address", address: "2118 Thornridge Cir. Syracuse, Connecticut 35624" },
    ])

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    const handleEdit = (item: Address) => {
        setEditingAddress({ ...item })
        setIsModalOpen(true)
    }

    const handleUpdate = () => {
        if (!editingAddress) return;

        setAddresses((prev) =>
            prev.map((addr) => (addr.id === editingAddress.id ? editingAddress : addr))
        )
        setIsModalOpen(false)
        setEditingAddress(null)
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-[20px] font-[600] pb-5">Address</h2>
            <div className="grid md:grid-cols-2 gap-6 w-full h-full md:h-[140px]">
                {addresses.map((item) => (
                    <div key={item.id} className="border rounded-lg p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{item.title}</p>
                            <button
                                onClick={() => handleEdit(item)}
                                className="flex items-center gap-1 text-sm text-gray-200 hover:text-blue-800 transition-colors"
                            >
                                <BiEditAlt size={14} /> Edit
                            </button>
                        </div>
                        <div className="flex flex-col text-[14px] leading-[22px] mt-2">
                            <p>{item.name}</p>
                            <p>{item.phone}</p>
                            <p>{item.address}</p>
                        </div>
                    </div>
                ))}

                {isModalOpen && editingAddress && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                            <h2 className="text-lg font-bold mb-4">Update {editingAddress.title}</h2>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Details
                            </label>
                            <textarea
                                className="w-full border p-2 rounded-md h-24 text-sm focus:none outline-none"
                                value={editingAddress.address}
                                onChange={(e) => setEditingAddress({ ...editingAddress, address: e.target.value })}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-800 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddressPage
