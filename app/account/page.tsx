"use client"
import { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import AccountSidebar from "../../components/layout/AccountSideBar"
import { Header } from "@/components/dynamicComponents"
import Footer from "@/components/layout/Footer"

type AccountFormValues = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  oldPassword: string
  newPassword: string
  repeatPassword: string
}

const page = () => {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
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
        setValue("displayName", metadata.username || "")
        setValue("email", data.user.email || "")
      } catch (err) {
        console.error("Unexpected error fetching user:", err)
      }
    }

    fetchUser()
  }, [supabase, setValue, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

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

    setSuccessMsg("Account updated successfully")
  }

  if (!user) return <p className="text-center">Loading...</p>
  return (
    <div>
      <Header />
      <h1 className="text-center font-poppins text-[54px] font-[500] my-[40px]">My Account</h1>
      <AccountSidebar user={user} onLogout={handleLogout} />
      <Footer />
    </div>
  )
}

export default page