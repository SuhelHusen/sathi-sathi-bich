"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"
import { Home, Calculator, Users, GamepadIcon } from "lucide-react"

export function NavBar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Bill Harmony</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/split-bill">
            <Button variant={isActive("/split-bill") ? "default" : "ghost"} size="sm">
              <Users className="h-4 w-4 mr-2" />
              Split Bill
            </Button>
          </Link>
          <Link href="/calculator">
            <Button variant={isActive("/calculator") ? "default" : "ghost"} size="sm">
              <Calculator className="h-4 w-4 mr-2" />
              Calculator
            </Button>
          </Link>
          <Link href="/settlement">
            <Button variant={isActive("/settlement") ? "default" : "ghost"} size="sm">
              <Users className="h-4 w-4 mr-2" />
              Settlement
            </Button>
          </Link>
          <Link href="/games">
            <Button variant={isActive("/games") ? "default" : "ghost"} size="sm">
              <GamepadIcon className="h-4 w-4 mr-2" />
              Games
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>

      <div className="md:hidden border-t">
        <div className="container mx-auto px-4 py-2 flex justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex flex-col h-auto py-2">
              <Home className="h-4 w-4 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link href="/split-bill">
            <Button variant="ghost" size="sm" className="flex flex-col h-auto py-2">
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs">Split</span>
            </Button>
          </Link>
          <Link href="/calculator">
            <Button variant="ghost" size="sm" className="flex flex-col h-auto py-2">
              <Calculator className="h-4 w-4 mb-1" />
              <span className="text-xs">Calc</span>
            </Button>
          </Link>
          <Link href="/settlement">
            <Button variant="ghost" size="sm" className="flex flex-col h-auto py-2">
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs">Settle</span>
            </Button>
          </Link>
          <Link href="/games">
            <Button variant="ghost" size="sm" className="flex flex-col h-auto py-2">
              <GamepadIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">Games</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

