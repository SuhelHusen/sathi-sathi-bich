"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Person } from "@/types"

interface PersonInputProps {
  person: Person
  onRemove: (id: string) => void
  total?: number
}

export function PersonInput({ person, onRemove, total }: PersonInputProps) {
  return (
    <div className="flex items-center justify-between p-2 border rounded-md">
      <div className="flex items-center gap-2">
        <div className="font-medium">{person.name}</div>
        {total !== undefined && total > 0 && <div className="text-sm text-muted-foreground">(${total.toFixed(2)})</div>}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(person.id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

