"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import Link from "next/link"
import { IoEyeOutline } from "react-icons/io5"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type SignUpFormValues = {
  name: string
  username: string
  email: string
  password: string
  agree: boolean
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

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          username: data.username,
        },
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="w-[80%] md:w-1/3 flex flex-col justify-center my-20 md:mt-0 ml-10 md:ml-25 text-[#6C7275]">

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

        <label>Your name</label>
        <input
          className="custom-input w-full border-b border-[#E8ECEF] mb-5"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-4">
            {errors.name.message}
          </p>
        )}

        <label>Username</label>
        <input
          className="custom-input w-full border-b border-[#E8ECEF] mb-5"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          })}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mb-4">
            {errors.username.message}
          </p>
        )}

        <label>Email Address</label>
        <input
          type="email"
          className="custom-input w-full border-b border-[#E8ECEF] mb-5"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-4">
            {errors.email.message}
          </p>
        )}

        <label>Password</label>
        <div className="flex border-b border-[#E8ECEF] items-center mb-5">
          <input
            type={showPassword ? "text" : "password"}
            className="custom-input w-full"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <IoEyeOutline className="text-2xl" />
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
            className="w-6 h-6 mt-1"
            {...register("agree", {
              required: "You must accept the terms",
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
          className="w-full text-center rounded-[8px] mt-6 py-[10px] bg-[#141718] text-white"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>

      </form>
    </div>
  )
}

export default SignupForm