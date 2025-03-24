"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, UserMinus } from "lucide-react"
import type { Item, Person } from "@/types"

interface BillTableProps {
  items: Item[]
  people: Person[]
  onRemoveItem: (id: string) => void
  onUpdateItem: (item: Item) => void
  onRemovePerson: (id: string) => void
}

export function BillTable({ items, people, onRemoveItem, onUpdateItem, onRemovePerson }: BillTableProps) {
  const togglePersonAssignment = (itemId: string, personId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const isAssigned = item.assignedTo.includes(personId)
    const updatedAssignedTo = isAssigned
      ? item.assignedTo.filter((id) => id !== personId)
      : [...item.assignedTo, personId]

    onUpdateItem({
      ...item,
      assignedTo: updatedAssignedTo,
    })
  }

  return (
    <div className="mt-4 border rounded-md overflow-auto max-h-[50vh]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="sticky left-0 top-0 bg-background z-30">Item</TableHead>
              <TableHead className="text-right sticky top-0 bg-background z-20">Qty</TableHead>
              <TableHead className="text-right sticky top-0 bg-background z-20">Unit Price</TableHead>
              <TableHead className="text-right sticky top-0 bg-background z-20">Total</TableHead>
              {people.map((person) => (
                <TableHead
                  key={person.id}
                  className="text-center relative min-w-[80px] sticky top-0 bg-background z-20"
                >
                  <div className="flex flex-col items-center">
                    <span>{person.name.substring(0, 8)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemovePerson(person.id)}
                      className="h-6 w-6 p-0 absolute top-0 right-0"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableHead>
              ))}
              <TableHead className="sticky right-0 top-0 bg-background z-30"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium sticky left-0 bg-background z-10">{item.name}</TableCell>
                <TableCell className="text-right">{item.quantity || 1}</TableCell>
                <TableCell className="text-right">${(item.pricePerUnit || item.price).toFixed(2)}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                {people.map((person) => (
                  <TableCell key={person.id} className="text-center">
                    <Checkbox
                      checked={item.assignedTo.includes(person.id)}
                      onCheckedChange={() => togglePersonAssignment(item.id, person.id)}
                    />
                  </TableCell>
                ))}
                <TableCell className="sticky right-0 bg-background z-10">
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

