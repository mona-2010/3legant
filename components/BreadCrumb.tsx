"use client";

import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";

type Crumb = {
  title: string;
  href: string;
};

type BreadcrumbProps = {
  currentPage: string;
  crumbs?: Crumb[]; 
};

export default function Breadcrumb({ currentPage, crumbs = [] }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-[16px] leading-[18px] tracking-[0.01em] font-medium">
      <Link
        className="text-[#605F5F] hover:text-baseblack transition-all"
        href="/"
      >
        Home
      </Link>

      {crumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-2">
          <RiArrowRightSLine />
          <Link
            href={crumb.href}
            className="text-[#605F5F] hover:text-baseblack transition-all"
          >
            {crumb.title}
          </Link>
        </span>
      ))}
      <span className="flex items-center gap-2">
        <RiArrowRightSLine />
        <p className="text-baseblack">{currentPage}</p>
      </span>
    </nav>
  );
}