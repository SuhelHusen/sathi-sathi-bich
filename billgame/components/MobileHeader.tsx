"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"
import { ChevronLeft, Home } from "lucide-react"

export function MobileHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const isHomePage = pathname === "/"

  const getTitle = () => {
    switch (pathname) {
      case "/":
        return "Bill Game Harmony"
      case "/split-bill":
        return "Split Bill"
      case "/split-bill/calculation":
        return "Add Items"
      case "/split-bill/calculation/settlement":
        return "Settlement"
      case "/games":
        return "Games"
      default:
        return "Bill Game Harmony"
    }
  }

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {!isHomePage && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="font-bold text-lg">{getTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

