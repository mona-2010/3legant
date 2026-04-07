"use client"
import { createClient } from '@/lib/supabase/client'
import { useForm, SubmitHandler } from "react-hook-form"
import { toast } from "react-toastify"

type FormValues = {
    email: string
}

const ForgotPwdForm = () => {
    const supabase = createClient()
    const {
        register,
        watch,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>()

    const handleForgotPassword: SubmitHandler<FormValues> = async (data) => {
        const { email } = data;

        const redirectUrl = `${window.location.origin}/reset`

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        })

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password reset link sent! Please check your email.");
            reset();
        }
    }

    return (
        <div className="w-[80%] md:w-1/3 flex flex-col justify-center my-20 md:mt-0 ml-5 md:ml-10 lg:ml-25 text-gray-200">
            <h1 className="font-poppins text-[40px] mb-15  font-[500] text-[#141718] leading-10">
                Forgot Password?
            </h1>

            <form onSubmit={handleSubmit(handleForgotPassword)} className="w-full mr-auto">
                <div className='border-b border-lightgray'>
                    <input
                    type="email"
                    className="custom-input w-full mb-1 focus:outline-none"
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                        },
                    })}
                    placeholder='Your email address'
                />
                    {errors.email && (
                        <p className="text-red-500 text-sm mb-4">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer w-full text-center rounded-[8px] mt-6 py-[10px] bg-[#141718] text-white"
                >
                    {isSubmitting ? "Sending link..." : "Send Reset Link"}
                </button>

            </form>
        </div>
    )
}

export default ForgotPwdForm