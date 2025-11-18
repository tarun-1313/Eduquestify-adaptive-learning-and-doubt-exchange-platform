"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Footer from "@/components/footer"

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    // Show footer only on teacher pages
    setShowFooter(pathname?.startsWith('/teacher') || false)
  }, [pathname])

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  )
}
