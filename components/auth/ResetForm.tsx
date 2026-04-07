"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { IoEyeOutline } from "react-icons/io5"
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
    <div className="w-[80%] md:w-1/3 flex flex-col justify-center my-20 md:mt-0 ml-5 md:ml-10 lg:ml-25 text-gray-200">
      <h1 className="mb-20 font-poppins text-[40px] font-[500] text-[#141718] leading-10">
        Reset Password
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full mr-auto">
        <div className="flex justify-between items-center mt-4">
          <label>New Password</label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <IoEyeOutline className="text-2xl" />
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          className="custom-input w-full border-b border-lightgray mb-1 focus:outline-none"
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

        {serverError && (
          <p className="text-red-500 text-sm mt-4">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-50 text-center rounded-[8px] mt-6 py-[10px] bg-[#141718] text-white"
        >
          {isSubmitting ? "Changing Password...." : "Set"}
        </button>

      </form>
    </div>
  )
}

export default ResetForm