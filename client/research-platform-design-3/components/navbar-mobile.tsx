"use client"

import { useState } from "react"
import { TopNavbar } from "./top-navbar"

export function NavbarWithMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <TopNavbar />
      {/* Mobile menu will be handled by responsive design in TopNavbar */}
    </>
  )
}
