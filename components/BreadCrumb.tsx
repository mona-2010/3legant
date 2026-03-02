"use client";

import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";

export default function Breadcrumb({ currentPage = "" }) {
  return (
    <nav className="flex gap-2 text-[16px] leading-[18px] tracking-[0.01em] font-medium">
      <Link
        className="text-[#666867] hover:text-baseblack transition-all"
        href="/"
      >
        Home
      </Link>
      <span><RiArrowRightSLine /></span>
      <p className="text-baseblack">{currentPage}</p>
    </nav>
  );
}
