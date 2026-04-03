"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import Link from "next/link"
import { IoEyeOutline } from "react-icons/io5"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type FormValues = {
  email: string
  password: string
  remember: boolean
}

const SigninForm = () => {
  const supabase = createClient()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setServerError(null)

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    const userId = signInData.user?.id
    if (!userId) {
      router.push("/")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profile?.role === "admin") router.push("/admin")
    else router.push("/")
  }

  return (
    <div className="w-[80%] md:w-1/3 flex flex-col justify-center my-20 md:mt-0 ml-10 md:ml-25 text-gray-200">
      <h1 className="font-poppins text-[40px] font-[500] text-[#141718] leading-15">
        Sign In
      </h1>

      <p>
        Don’t have an account yet?{" "}
        <Link href="/sign-up" className="text-[#38CB89] leading-15">
          Sign Up
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full mr-auto">
        <div className="border-b border-lightgray pb-2">
          <input
            type="email"
            className="custom-input w-full mb-1 focus:outline-none"
            placeholder="Your email address"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mb-4">
            {errors.email.message}
          </p>
        )}

        <div className="flex justify-between items-center mt-4 border-b border-lightgray pb-2">
          <input
            type={showPassword ? "text" : "password"}
            className="custom-input w-full mb-1 focus:outline-none"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-4">
              {errors.password.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <IoEyeOutline className="text-2xl" />
          </button>
        </div>

        <div className="flex mt-5 justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="w-6 h-6"
              {...register("remember")}
            />
            <p className="ml-2">Remember me</p>
          </div>
          <Link href='/forget-password'>Forgot Password?</Link>

        </div>
        {serverError && (
          <p className="text-red-500 text-sm mt-4">
            {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-center rounded-[8px] mt-6 py-[10px] bg-[#141718] text-white"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

      </form>

    </div>
  )
}

export default SigninForm

