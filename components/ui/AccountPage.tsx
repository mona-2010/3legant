"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { createClient } from "@/lib/supabase/client"
import { fetchUserProfile, setUserProfile } from "@/store/authSlice"
import { updateUserProfile, uploadAvatarAndUpdateProfile } from "@/lib/actions/profile"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "react-toastify"
import { useAuth } from "@/components/providers/AuthProvider"
import AccountSkeleton from "../common/AccountSkeleton"
import type { AppDispatch, RootState } from "@/store/store"

type AccountFormValues = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  oldPassword: string
  newPassword: string
  repeatPassword: string
}

const AccountPage = () => {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading } = useAuth()
  const profile = useSelector((state: RootState) => state.auth.profile)

  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/sign-in")
      return
    }

    // Fetch profile from Redux cache (will check TTL and only fetch from API if stale)
    void dispatch(fetchUserProfile())
  }, [loading, router, user, dispatch])

  useEffect(() => {
    // Update form when profile data is loaded from Redux
    const fullName = profile.full_name || user?.user_metadata?.full_name || ""
    const [firstName, ...lastParts] = fullName.split(" ")

    setValue("firstName", firstName || "")
    setValue("lastName", lastParts.join(" ") || "")
    setValue("displayName", user?.user_metadata?.display_name || "")
    setValue("email", user?.email || "")

    if (profile.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    } else if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url)
    }
  }, [profile.full_name, profile.avatar_url, user, setValue])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.warn("No file selected")
      return
    }
    if (!user) {
      console.error("User not authenticated")
      toast.error("You must be logged in to upload an avatar")
      return
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Image must be under 2MB")
      return
    }

    setUploading(true)
    
    const ext = file.name.split(".").pop()
    const fileName = `${user.id}-${uuidv4()}.${ext}`
    const filePath = `${user.id}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        toast.error(`Failed to upload avatar: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl
      const result = await uploadAvatarAndUpdateProfile(publicUrl)

      if (!result.success) {
        console.error("Profile update failed:", result.error)
        toast.error(result.error || "Failed to update avatar")
        setUploading(false)
        return
      }

      setAvatarUrl(publicUrl)
      toast.success("Avatar updated!")
      
      // Update Redux cache with new avatar
      dispatch(setUserProfile({
        full_name: profile.full_name,
        avatar_url: publicUrl,
      }))
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setUploading(false)
    } catch (err) {
      toast.error("An unexpected error occurred during upload")
      setUploading(false)
    }
  }

  const onSubmit: SubmitHandler<AccountFormValues> = async (data) => {
    setServerError(null)
    setSuccessMsg(null)

    if (!user) {
      setServerError("You must be signed in to update account details")
      return
    }

    const oldPassword = data.oldPassword?.trim() || ""
    const newPassword = data.newPassword?.trim() || ""
    const repeatPassword = data.repeatPassword?.trim() || ""

    if (oldPassword && !newPassword && !repeatPassword) {
      setServerError("Enter new password")
      return
    }

    if (newPassword !== repeatPassword) {
      setServerError("New and repeat new password does not match")
      return
    }

    if (oldPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email || "",
        password: oldPassword,
      })
      if (signInError) {
        setServerError("Old password is incorrect")
        return
      }
    }

    if (newPassword) {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setServerError(updateError.message)
        return
      }
    }

    const fullName = `${data.firstName} ${data.lastName}`.trim()

    const result = await updateUserProfile({
      fullName,
      displayName: data.displayName,
    })

    if (!result.success) {
      setServerError(result.error || "Failed to update profile")
      return
    }

    // Update Redux cache after successful profile update
    dispatch(setUserProfile({
      full_name: fullName,
      avatar_url: profile.avatar_url,
    }))

    toast.success("Account updated successfully")
    setSuccessMsg("Account updated successfully")
    setValue("oldPassword", "")
    setValue("newPassword", "")
    setValue("repeatPassword", "")
  }

  if (loading || !user) return <AccountSkeleton />

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-20 min-h-[80vh]">
        <div className="flex-1 mb-8 space-y-5">
          <h4 className="text-[20px] font-[600]">Account Details</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-full space-y-5">
            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>First Name *</label>
              <input
                placeholder="First Name"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("firstName", { required: "First name required" })}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>Last Name</label>
              <input
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("lastName")}
              />
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>Display Name *</label>
              <input
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("displayName", { required: "Display name required" })}
              />
              <p className="text-gray-200 italic">This will be how your name will be displayed in the account section and in reviews</p>
              {errors.displayName && (
                <p className="text-red-500 text-sm">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>Email *</label>
              <input
                type="email"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("email")}
                disabled
              />
              <p className="text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>Old Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("oldPassword")}
              />
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("newPassword")}
              />
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>Repeat New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("repeatPassword")}
              />
            </div>

            {serverError && <p className="text-red-500">{serverError}</p>}
            {successMsg && <p className="text-green-500">{successMsg}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer max-w-lg mt-3 bg-black text-white px-9 py-2.5 rounded-lg"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AccountPage