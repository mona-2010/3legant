"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
type FormValues = {
  password: string
}

const ResetForm = () => {
  const supabase = createClient();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })
    if (error) {
      alert(error.message);
    }
    else {
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000)
    }
  }

  return (
    <div className="w-[80%] md:w-1/3 flex flex-col justify-center my-10 md:my-0 md:mt-0 mx-auto md:mx-10 lg:mx-25 text-gray-200">
      <h1 className="mb-5 font-poppins text-[25px] md:text-[40px] font-[500] text-[#141718] leading-10">
        Reset Password
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full mr-auto">
        <div className="flex justify-between items-center md:mt-4 border-b border-lightgray">
          <input
            type={showPassword ? "text" : "password"}
            className="custom-input w-full mb-1 focus:outline-none"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            placeholder="New Password"
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

        {serverError && (
          <p className="text-red-500 text-sm mt-4">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full md:w-50 text-center rounded-[8px] mt-6 py-[10px] bg-[#141718] text-white"
        >
          {isSubmitting ? "Changing Password...." : "Set"}
        </button>

      </form>
    </div>
  )
}

export default ResetForm