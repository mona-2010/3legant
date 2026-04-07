"use client";

import Link from "next/link";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

type Crumb = {
  title: string;
  href: string;
};

type BreadcrumbProps = {
  currentPage: string;
  crumbs?: Crumb[];
  showMobileBackOnly?: boolean;
  backHref?: string;
  backLabel?: string;
};

export default function Breadcrumb({
  currentPage,
  crumbs = [],
  showMobileBackOnly = false,
  backHref = "/",
  backLabel = "back",
}: BreadcrumbProps) {
  return (
    <div>
      {showMobileBackOnly && (
        <Link
          href={backHref}
          className="md:hidden inline-flex items-center text-[#605F5F] hover:text-baseblack transition-all"
        >
          <RiArrowLeftSLine />
          <span>{backLabel}</span>
        </Link>
      )}

      <nav className={`font-inter flex items-center flex-wrap gap-2 text-[14px] leading-[18px] tracking-[0.01em] font-medium ${showMobileBackOnly ? "hidden md:flex" : "flex"}`}>
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
            className="text-[#605F5F] hover:text-baseblack transition-all capitalize"
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
    </div>
  );
}