import Link from "next/link";
import { AiOutlineYoutube } from "react-icons/ai";
import { FiFacebook } from "react-icons/fi";
import { PiInstagramLogo } from "react-icons/pi";

const Footer = () => {
    return (
        <footer className="w-full bg-[#141718] px-[30px] md:px-[50px] lg:px-[80px] xl:px-[140px]">
            <div className="py-15 text-lightgray">
                <div className="flex flex-col md:gap-10 md:flex-row md:justify-between md:border-b-1 ">
                    <div className="flex flex-col text-center md:flex-row my-auto">
                        <p className="font-poppins text-center mx-auto font-medium text-2xl md:pr-8 md:my-auto md:border-r md:border-gray-200">
                            3legant<span className="text-gray-200">.</span>
                        </p>
                        <Link href="" className="pt-5 md:py-0 md:pl-8 my-auto">Gift & Decoration Store</Link>
                    </div>

                    <div className="flex flex-col mt-10 text-center md:flex-row">
                        <Link href="/" className="mb-8 md:mr-10 cursor-pointer">
                            Home
                        </Link>
                        <Link href="/shop" className="mb-8 md:mr-10">
                            Shop
                        </Link>
                        <Link href="/blog" className="mb-8 md:mr-10">
                            Blog
                        </Link>
                        <Link href="/contact-us" className="mb-10">
                            Contact Us
                        </Link>
                    </div>
                </div>

                <div className="md:border-none border-t-2 md:border-gray-200 flex flex-col md:flex-row-reverse md:justify-between md:mt-4">
                    <div className="mt-5 md:mt-0 flex items-center justify-center gap-[17px] text-[30px]">
                        <PiInstagramLogo />
                        <FiFacebook />
                        <AiOutlineYoutube />
                    </div>

                    <div className="flex flex-col md:flex-row-reverse">
                        <div className="flex justify-center font-poppins font-semibold text-[14px] text-white mt-8 md:my-auto">
                            <a href="" className="mr-7">Privacy Policy</a>
                            <a href="">Terms of Use</a>
                        </div>
                        <p className="text-bright-gray text-sm font-normal text-center mt-7 md:mr-7 md:my-auto">
                            Copyright © 2023 3legant. All rights reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;