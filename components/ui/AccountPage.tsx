"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "react-toastify"
import { useAuth } from "@/components/providers/AuthProvider"
import AccountSkeleton from "../common/AccountSkeleton"

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
  const { user, loading } = useAuth()

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
  } = useForm<AccountFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      oldPassword: "",
      newPassword: "",
      repeatPassword: "",
    }
  })

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/sign-in")
      return
    }

    const fetchProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error)
          return
        }

        const fullName = profile?.full_name || user.user_metadata?.full_name || ""
        const [firstName, ...lastParts] = fullName.split(" ")

        setValue("firstName", firstName || "")
        setValue("lastName", lastParts.join(" ") || "")
        setValue("displayName", user.user_metadata?.display_name || "")
        setValue("email", user.email || "")

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url)
        } else if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url)
        }
      } catch (err) {
        console.error("Unexpected error fetching user profile:", err)
      }
    }

    fetchProfile()
  }, [loading, user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Image must be under 2MB")
      return
    }

    setUploading(true)
    const ext = file.name.split(".").pop()
    const filePath = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error("Failed to upload avatar")
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl

    await supabase.from("profiles").upsert({ id: user.id, avatar_url: publicUrl })
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })

    setAvatarUrl(publicUrl)
    toast.success("Avatar updated!")
    setUploading(false)
  }

  const onSubmit: SubmitHandler<AccountFormValues> = async (data) => {
    setServerError(null)
    setSuccessMsg(null)

    if (!user) {
      setServerError("You must be signed in to update account details")
      return
    }

    if (data.oldPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email || "",
        password: data.oldPassword,
      })
      if (signInError) {
        setServerError("Old password is incorrect")
        return
      }
    }

    if (data.newPassword) {
      if (data.newPassword !== data.repeatPassword) {
        setServerError("New passwords do not match")
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        setServerError(updateError.message)
        return
      }
    }

    const fullName = `${data.firstName} ${data.lastName}`.trim()

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        display_name: data.displayName,
      },
    })

    if (metadataError) {
      setServerError(metadataError.message)
      return
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      display_name: data.displayName,
    })

    if (profileError) {
      console.error("Profile sync error:", profileError.message)
      setServerError("Failed to sync profile. Changes saved to auth but not synced to profile.")
      return
    }

    toast.success("Account updated successfully")
    setSuccessMsg("Account updated successfully")
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
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("oldPassword")}
              />
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>New Password</label>
              <input
                type="password"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("newPassword")}
              />
            </div>

            <div>
              <label htmlFor="fullname" className='font-[600] uppercase text-gray-200 text-[14px]'>Repeat New Password</label>
              <input
                type="password"
                className="custom-input w-full border-2 rounded-md mt-2 p-2 border-gray-300 focus:outline-none"
                {...register("repeatPassword")}
              />
            </div>

            {serverError && <p className="text-red-500">{serverError}</p>}
            {successMsg && <p className="text-green-500">{successMsg}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="max-w-lg mt-3 bg-black text-white px-9 py-2.5 rounded-lg"
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