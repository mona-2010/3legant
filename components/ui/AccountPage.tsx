"use client"

import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error("Supabase getUser error:", error)
          return
        }

        if (!data.user) {
          router.push("/sign-in")
          return
        }

        setUser(data.user)
        const metadata = data.user.user_metadata || {}
        const fullName = metadata.full_name || ""
        const [firstName, lastName] = fullName.split(" ")

        setValue("firstName", firstName || "")
        setValue("lastName", lastName || "")
        setValue("displayName", metadata.display_name || "")
        setValue("email", data.user.email || "")
      } catch (err) {
        console.error("Unexpected error fetching user:", err)
      }
    }

    fetchUser()
  }, [supabase, setValue, router])

  const onSubmit: SubmitHandler<AccountFormValues> = async (data) => {
    setServerError(null)
    setSuccessMsg(null)

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

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        display_name: data.displayName,
      },
    })

    if (metadataError) {
      setServerError(metadataError.message)
      return
    }
    alert("Account updated successfully")
    setSuccessMsg("Account updated successfully")
  }

  if (!user) return <p className="text-center">Loading...</p>

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
              className="max-w-lg mt-3 bg-black text-white px-9 py-4 rounded-lg"
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