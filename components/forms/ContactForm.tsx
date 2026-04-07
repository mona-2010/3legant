"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { BiLocationPlus } from 'react-icons/bi';
import { FiPhone } from 'react-icons/fi';
import { HiOutlineMail } from 'react-icons/hi';
import { IoHomeOutline } from 'react-icons/io5';
import { submitContactMessage } from "@/lib/actions/contact";

const values = [
    { icon: <IoHomeOutline />, title: "Address", desc: "234 Hai Trieu, Ho Chi Minh City, Viet Nam" },
    { icon: <FiPhone />, title: "Contact us", desc: "+84 234 567 890" },
    { icon: <HiOutlineMail />, title: "Email", desc: "hello@3legant.com" },
];

type ContactFormValues = {
    fullName: string
    email: string
    message: string
}

const ContactForm = () => {
    const [serverError, setServerError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            message: "",
        },
    })

    const onSubmit = async (values: ContactFormValues) => {
        setServerError(null)
        setSubmitted(false)

        const result = await submitContactMessage(values)
        if (result.error) {
            setServerError(result.error)
            return
        }

        reset()
        setSubmitted(true)
    }

    return (
        <>
            <h1 className='font-poppins font-medium text-[24px] md:text-[40px] text-center leading-[44px] my-10'>Contact Us</h1>
            <div className="text-center flex flex-col md:flex-row md:justify-between lg:flex-row lg:justify-between my-4 gap-6">
                {values.map((value, index) => (
                    <div key={index} className="flex flex-col items-center w-full overflow-hidden">
                        <div className="text-lg flex flex-col items-center justify-center md:text-4xl bg-gray-100 w-[250px] md:w-[390px] h-[100px] md:h-[200px] px-2 md:px-8 max-sm:px-4 py-12">
                            {value.icon}
                            <p className="uppercase max-lg:text-md font-inter text-[20px] py-2 md:py-4 font-[700] text-gray-200 max-md:text-sm max-sm:font-semibold">
                                {value.title}
                            </p>
                            <p className="px-2 md:px-10 w-[90%] md:w-full font-semibold text-[12px] md:text-[12px] lg:text-[16px] text-[#141718]">
                                {value.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex flex-col md:flex-row justify-center gap-10 my-10'>
                <form onSubmit={handleSubmit(onSubmit)} className='w-full md:w-1/2'>
                    <div className='flex flex-col gap-3'>
                        <label htmlFor="fullname" className='font-[600] uppercase text-gray-200'>Full Name</label>
                        <input
                            type="text"
                            id='fullname'
                            placeholder="Your Name"
                            className='border border-lightgray rounded-md px-4 py-3 mb-3'
                            {...register("fullName", {
                                required: "Full name is required",
                                minLength: {
                                    value: 2,
                                    message: "Full name must be at least 2 characters",
                                },
                            })}
                        />
                        {errors.fullName && <p className='text-red-600 text-sm -mt-2 mb-2'>{errors.fullName.message}</p>}
                        <label htmlFor="email" className='font-[600] uppercase text-gray-200'>Email Address</label>
                        <input
                            type="email"
                            id='email'
                            placeholder="Your Email"
                            className='border border-lightgray rounded-md px-4 py-3 mb-3'
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: "Please enter a valid email address",
                                },
                            })}
                        />
                        {errors.email && <p className='text-red-600 text-sm -mt-2 mb-2'>{errors.email.message}</p>}
                        <label htmlFor="message" className='font-[600] uppercase text-gray-200'>Message</label>
                        <textarea
                            id='message'
                            placeholder="Your Message"
                            rows={8}
                            className='border border-lightgray rounded-md px-4 py-2 mb-3'
                            {...register("message", {
                                required: "Message is required",
                                minLength: {
                                    value: 10,
                                    message: "Message must be at least 10 characters",
                                },
                            })}
                        />
                        {errors.message && <p className='text-red-600 text-sm -mt-2 mb-2'>{errors.message.message}</p>}
                    </div>
                    {serverError && <p className='text-red-600 text-sm mt-2'>{serverError}</p>}
                    {submitted && <p className='text-green-700 text-sm mt-2'>Thanks for contacting us. We will get back to you soon.</p>}
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='cursor-pointer text-center rounded-[8px] mt-6 py-[10px] px-[40px] bg-[#141718] text-white disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                        {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                </form>
                <div className="relative w-full md:w-1/2 h-[50vh] md:h-[550px]">

                    <iframe
                        className="w-full h-full border-0 block"
                        title="Google Maps Location - New York"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193571.43883442905!2d-74.11808690587499!3d40.70583163920109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c250b41c23b6b1%3A0xa9250b1c6b1a0!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1709459285600!5m2!1sen!2sin"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                            <BiLocationPlus className='text-2xl' />
                        </div>
                    </div>

                </div>
            </div>

        </>
    );
}

export default ContactForm