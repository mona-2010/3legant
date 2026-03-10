"use client"
import { useState } from "react";
import { LuArrowRight, LuTicketPercent } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import ButtonText from "./ButtonText";
import Link from "next/link";


const navigationHeader = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };
  return (
    <>
      {isVisible && (
        <div className="relative gap-2 w-full h-10 font-inter flex justify-center items-center py-2 bg-gray-100 text-[12px] md:text-[16px]">
          <LuTicketPercent className="text-xl md:text-2xl"/>
          <p className="font-bold text-[12px] md:text-[16px] text-[#343839]">
            30% off storewide — Limited time!
          </p>
        <Link href="/shop" className="font-inter h-[10px] md:h-[20px] flex items-center text-blue-500 hover:border-b-2">Shop Now <LuArrowRight /></Link>
          <RxCross2 onClick={handleClose} className="absolute mx-4 right-0 sm:w-5 sm:h-5 cursor-pointer" />
        </div>
      )}
    </>
  );
};

export default navigationHeader;


