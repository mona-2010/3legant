"use client"
import { useEffect, useState, useRef } from "react"
import { BiEditAlt } from "react-icons/bi"
import { FiPlus } from "react-icons/fi"
import { RxCross1 } from "react-icons/rx"
import { getUserAddresses, createAddress, updateAddress, deleteAddress, syncMissingAddressesFromOrders } from "@/lib/actions/addresses"
import { UserAddress } from "@/types"
import AddressSkeleton from "../common/AddressSkeleton"

const AddressPage = () => {
    const [addresses, setAddresses] = useState<UserAddress[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Partial<UserAddress> | null>(null)
    const [saving, setSaving] = useState(false)
    const hasLoadedRef = useRef(false)

    const loadAddresses = async () => {
        // Load addresses immediately without waiting for sync
        const { data } = await getUserAddresses()
        if (data) setAddresses(data)
        setLoading(false)
        
        // Sync addresses from historical orders in background (non-blocking)
        syncMissingAddressesFromOrders().catch(err => console.error("Address sync error:", err))
    }

    useEffect(() => {
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true
        loadAddresses()
    }, [])

    const handleEdit = (item: UserAddress) => {
        setEditingAddress({ ...item })
        setIsModalOpen(true)
    }

    const handleAdd = (type: "billing" | "shipping") => {
        setEditingAddress({
            type,
            first_name: "",
            last_name: "",
            phone: "",
            street_address: "",
            city: "",
            state: "",
            zip_code: "",
            country: "",
            is_default: addresses.filter(a => a.type === type).length === 0,
        })
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!editingAddress) return
        setSaving(true)

        if (editingAddress.id) {
            const { data } = await updateAddress(editingAddress.id, editingAddress)
            if (data) {
                setAddresses(prev => prev.map(a => a.id === data.id ? data : a))
            }
        } else {
            const { data } = await createAddress({
                type: editingAddress.type || "billing",
                first_name: editingAddress.first_name || "",
                last_name: editingAddress.last_name || "",
                phone: editingAddress.phone || "",
                street_address: editingAddress.street_address || "",
                city: editingAddress.city || "",
                state: editingAddress.state || "",
                zip_code: editingAddress.zip_code || "",
                country: editingAddress.country || "",
                is_default: editingAddress.is_default || false,
            })
            if (data) setAddresses(prev => [...prev, data])
        }

        setSaving(false)
        setIsModalOpen(false)
        setEditingAddress(null)
    }

    const handleDelete = async (id: string) => {
        await deleteAddress(id)
        setAddresses(prev => prev.filter(a => a.id !== id))
    }

    if (loading) return <AddressSkeleton />

    return (
        <div className="flex flex-col py-4">
            <div className="flex items-center justify-between pb-5 gap-5 md:gap-10">
                <h2 className="text-[20px] font-[600]">Address</h2>
                <button
                    onClick={() => handleAdd("shipping")}
                    className="flex items-center gap-1 text-sm bg-black text-white px-3 py-1.5 rounded"
                >
                    <FiPlus size={14} /> Add Address
                </button>
            </div>

            {addresses.length === 0 && (
                <p className="text-gray-500">No addresses saved yet.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {addresses.map((item) => (
                    <div key={item.id} className="border rounded-lg p-6 flex flex-col justify-between">
                        <div className="flex flex-row items-center gap-3 justify-between">
                            <p className="font-semibold capitalize">{item.type} Address</p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex items-center gap-1 text-sm text-gray-200 hover:text-blue-800 transition-colors"
                                >
                                    <BiEditAlt size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-gray-200 hover:text-red-500 transition-colors"
                                >
                                    <RxCross1 size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col text-[14px] leading-[22px]">
                            <p>{item.first_name} {item.last_name}</p>
                            <p>{item.phone}</p>
                            <p>{item.street_address}, {item.city}, {item.state} {item.zip_code}</p>
                            <p>{item.country}</p>
                            {item.is_default && (
                                <span className="text-xs text-green-600 mt-1">Default</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingAddress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-bold mb-4">
                            {editingAddress.id ? "Update" : "Add"} Address
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full border p-2 rounded-md text-sm outline-none"
                                    value={editingAddress.type || "billing"}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, type: e.target.value as "billing" | "shipping" })}
                                >
                                    <option value="billing">Billing</option>
                                    <option value="shipping">Shipping</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    className="w-full border p-2 rounded-md text-sm outline-none"
                                    value={editingAddress.first_name || ""}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, first_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    className="w-full border p-2 rounded-md text-sm outline-none"
                                    value={editingAddress.last_name || ""}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, last_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    className="w-full border p-2 rounded-md text-sm outline-none"
                                    value={editingAddress.phone || ""}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    className="w-full border p-2 rounded-md text-sm outline-none"
                                    value={editingAddress.street_address || ""}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, street_address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        className="w-full border p-2 rounded-md text-sm outline-none"
                                        value={editingAddress.city || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        className="w-full border p-2 rounded-md text-sm outline-none"
                                        value={editingAddress.state || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                    <input
                                        className="w-full border p-2 rounded-md text-sm outline-none"
                                        value={editingAddress.zip_code || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, zip_code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        className="w-full border p-2 rounded-md text-sm outline-none"
                                        value={editingAddress.country || ""}
                                        onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={editingAddress.is_default || false}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, is_default: e.target.checked })}
                                />
                                Set as default
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setIsModalOpen(false); setEditingAddress(null) }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-800 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddressPage
