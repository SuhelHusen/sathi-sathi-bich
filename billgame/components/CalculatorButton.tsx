"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalculatorButtonProps {
  children: React.ReactNode
  onClick: () => void
  className?: string
}

export function CalculatorButton({ children, onClick, className }: CalculatorButtonProps) {
  return (
    <Button type="button" onClick={onClick} className={cn("h-14 text-lg font-medium", className)} variant="secondary">
      {children}
    </Button>
  )
}

