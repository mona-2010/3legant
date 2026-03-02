"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

type NavLinkProps = {
  href: string
  children: ReactNode
  exact?: boolean
}

export default function NavLink({ href, children, exact = false }: NavLinkProps) {
  const pathname = usePathname()

  const isActive = exact
    ? pathname === href
    : href === "/"
      ? pathname === "/"
      : pathname.startsWith(href)

  const baseStyle = "transition"
  const activeStyle = "text-black font-medium"
  const inactiveStyle = "text-gray-500 hover:text-black"

  return (
    <Link
      href={href}
      className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
    >
      {children}
    </Link>
  )
}