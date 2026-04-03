"use client"
import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadAvatarAndUpdateProfile } from "@/lib/actions/profile"
import { v4 as uuidv4 } from "uuid"
import { FiEdit2 } from "react-icons/fi"
import { toast } from "react-toastify"

type Props = {
  user: any
  onLogout?: () => void
  children: React.ReactNode
}

const tabs = [
  { label: "Account", href: "/account" },
  { label: "Address", href: "/account/addresses" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
]

const AccountSidebar = ({ user, onLogout, children }: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) {
      console.warn("No file selected or user not found")
      return
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Image must be under 2MB")
      return
    }

    setIsUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${uuidv4()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      const result = await uploadAvatarAndUpdateProfile(publicUrl)

      if (!result.success) {
        console.error("Profile update failed:", result.error)
        throw new Error(result.error || "Failed to update profile")
      }

      setAvatarUrl(publicUrl)
      toast.success("Avatar updated successfully!")

    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const isActive = (href: string) => {
    if (href === "/account") return pathname === "/account"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 pb-16 mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]">
      <div className="flex flex-col lg:min-w-[298px] w-full md:w-64 lg:w-64 bg-gray-100 rounded-xl p-6 h-fit">
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
            value={tabs.find(t => isActive(t.href))?.label || "Account"}
            onChange={(e) => {
              if (e.target.value === "__logout__") {
                onLogout?.()
                return
              }

              const tab = tabs.find(t => t.label === e.target.value)
              if (tab) router.push(tab.href)
            }}
            className="w-full border rounded-lg p-3"
          >
            {tabs.map((tab) => (
              <option key={tab.label}>{tab.label}</option>
            ))}
            <option value="__logout__">Log Out</option>
          </select>
        </div>

        <nav className="hidden md:flex flex-col gap-2">

          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => router.push(tab.href)}
              className={`cursor-pointer text-left py-2.5 px-4 border-b-2 transition-colors ${isActive(tab.href)
                ? "border-current"
                : "border-transparent hover:border-gray-300 text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={onLogout}
            className="cursor-pointer text-left py-2.5 px-4 text-red-600 border-b-2 border-transparent hover:border-red-600"
          >
            Log Out
          </button>
        </nav>

      </div>
      {children}
    </div>
  )
}

export default AccountSidebar