"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import Link from "next/link"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

type SignUpFormValues = {
  name: string
  username: string
  email: string
  password: string
  agree: boolean
}

const mapSignUpErrorMessage = (message: string) => {
  const normalized = message.toLowerCase()

  if (normalized.includes("database error saving new user")) {
    return "Sign-up is temporarily unavailable due to a server profile setup issue. Please try again in a minute or contact support if it continues."
  }

  return message
}

const SignupForm = () => {
  const supabase = createClient()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>()

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setServerError(null)

    const emailRedirectTo = `${window.location.origin}/sign-in`

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo,
        data: {
          name: data.name,
          full_name: data.name,
          display_name: data.username,
          username: data.username,
          user_name: data.username,
        },
      },
    })

    if (error) {
      setServerError(mapSignUpErrorMessage(error.message))
      return
    }

    toast.success("Account created. Please check your email to confirm your account.")
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <div className="w-[80%] md:w-1/3 flex flex-col justify-center my-20 md:mt-0 ml-5 md:ml-10 lg:ml-25 text-gray-200">
      <h1 className="font-poppins text-[40px] font-[500] text-[#141718] leading-10">
        Sign up
      </h1>

      <p>
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#38CB89] leading-15">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full mr-auto">
        <div className="border-b border-lightgray py-4">
          <input
            className="custom-input w-full mb-2 focus:outline-none"
            {...register("name", { required: "Name is required" })}
            placeholder="Your name"
          />
        </div>
        {errors.name && (
          <p className="text-red-500 text-sm mb-4">
            {errors.name.message}
          </p>
        )}

        <div className="border-b border-lightgray py-4">
          <input
            className="custom-input w-full mb-2 focus:outline-none"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
            placeholder="Username"
          />
        </div>
        {errors.username && (
          <p className="text-red-500 text-sm mb-4">
            {errors.username.message}
          </p>
        )}

        <div className="border-b border-lightgray py-4">
          <input
            type="email"
            className="custom-input w-full mb-2 focus:outline-none"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="Email address"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mb-4">
            {errors.email.message}
          </p>
        )}

        <div className="flex border-b border-lightgray items-center py-4 focus:outline-none">
          <input
            type={showPassword ? "text" : "password"}
            className="flex custom-input w-full mb-2 focus:outline-none"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            placeholder="Password"
          />
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <IoEyeOffOutline className="text-2xl" />
            ) : (
              <IoEyeOutline className="text-2xl" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mb-4">
            {errors.password.message}
          </p>
        )}

        <div className="flex mt-5 items-start">
          <input
            type="checkbox"
            required
            className="cursor-pointer w-6 h-6 mt-1 "
            {...register("agree", {
              required: "You must accept the terms and conditions",
            })}
          />
          <p className="ml-2">
            I agree with{" "}
            <Link href="/privacy-policy" className="text-[#141718] font-semibold">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms-of-use" className="text-[#141718] font-semibold">
              Terms of use
            </Link>
          </p>
        </div>
        {errors.agree && (
          <p className="text-red-500 text-sm mt-2">
            {errors.agree.message}
          </p>
        )}

        {serverError && (
          <p className="text-red-500 text-sm mt-4">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-center rounded-[8px] mt-6 py-[10px] bg-[#141718] text-white"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>

      </form>
    </div>
  )
}

export default SignupForm