"use client"
import React, { useState } from "react"
import AccountPage from "../ui/AccountPage"
import AddressPage from "../ui/AddressPage"
import WishlistPage from "../ui/WishlistPage"
import OrdersPage from "../ui/OrdersPage"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { FiEdit2 } from "react-icons/fi"

type Props = {
  user: any
  onLogout?: () => void
}

const tabs = ["Account", "Address", "Orders", "Wishlist"]

const AccountSidebar = ({ user, onLogout }: Props) => {
  const [activeTab, setActiveTab] = useState("Account")
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) throw userError

      const fileExt = file.name.split(".").pop()
      const fileName = `${userData.user.id}-${uuidv4()}.${fileExt}`
      const filePath = `${userData.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      })

      if (updateError) throw updateError
      setAvatarUrl(publicUrl)

    } catch (error: any) {

      console.error("Error uploading image:", error)
      alert(`Error uploading image: ${error.message}`)
    } finally {
      setIsUploading(false)

    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Account":
        return <AccountPage />
      case "Address":
        return <AddressPage />
      case "Orders":
        return <OrdersPage />
      case "Wishlist":
        return <WishlistPage />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-20 py-4 mx-[30px] md:mx-[50px] lg:mx-[140px]">
      <div className="flex flex-col min-w-[298px] w-full md:w-64 bg-gray-100 rounded-xl p-6 h-fit">
        {user && (
          <div className="flex flex-col items-center mb-8">
            <label className="cursor-pointer relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                  {user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md opacity-100 transition">
                <FiEdit2 size={14} />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {isUploading && (
              <p className="text-xs mt-2 text-gray-500">Uploading...</p>
            )}
            <p className="font-semibold text-center mt-2">
              {user.user_metadata?.full_name || user.email}
            </p>
          </div>
        )}

        <div className="md:hidden mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            {tabs.map((tab) => (
              <option key={tab}>{tab}</option>
            ))}
          </select>
        </div>

        <nav className="hidden md:flex flex-col gap-2">

          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left py-2.5 px-4 border-b-2 transition-colors ${activeTab === tab
                ? "border-current"
                : "border-transparent hover:border-gray-300 text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}

          <button
            onClick={onLogout}
            className="text-left py-2.5 px-4 text-red-600 border-b-2 border-transparent hover:border-red-600"
          >
            Log Out
          </button>
        </nav>

      </div>
      {renderTabContent()}
    </div>
  )
}

export default AccountSidebar