"use client"

import drawer from "../../app/assets/images/drawer_2.jpg"
import chair from "../../app/assets/images/chair_2.jpg"
import { AiOutlineMail } from "react-icons/ai"
import Image from "next/image"
import Link from "next/link"

const Newsletter = () => {
  return (
    <section className="relative overflow-hidden mt-4 md:mt-10 bg-[#F2F4F6]">
      <Image
        src={drawer}
        alt="drawer"
        className="pointer-events-none absolute left-[-140px] top-[-240] h-[850px] w-[580px] object-contain mix-blend-darken max-lg:w-[380px] max-md:hidden"
      />

      <Image
        src={chair}
        alt="chair"
        className="pointer-events-none absolute bottom-[-200px] right-[-320px] h-[700px] w-[690px] mix-blend-darken max-lg:w-[460px] max-md:hidden"
      />

      <div className="relative flex flex-col justify-center items-center py-10 md:py-15 lg:py-24 px-8">

        <div>
          <p className="text-center mb-2 text-[40px] font-poppins">
            Join Our Newsletter
          </p>
          <p className="font-inter font-normal text-[18px] text-chinese-black text-center mb-8">
            Sign up for deals, new products and promotions
          </p>
        </div>

        <div
          className="mt-8 flex w-[488px] items-center border-b border-gray-200 font-inter font-medium text-black max-lg:w-[400px] max-sm:mx-auto max-sm:w-auto"
          style={{ height: 48 }}
        >
          <div className="flex items-center w-full">
            <AiOutlineMail className="mr-2 text-black" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full bg-transparent focus:outline-none"
            />
          </div>

          <Link href="/sign-up" className="ml-4 whitespace-nowrap">
            Signup
          </Link>
        </div>

      </div>
    </section>
  )
}

export default Newsletter