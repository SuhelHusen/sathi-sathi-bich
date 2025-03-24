"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Item, Person } from "@/types"

interface ItemInputProps {
  people: Person[]
  onAddItem: (item: Item) => void
}

export function ItemInput({ people, onAddItem }: ItemInputProps) {
  const [itemName, setItemName] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [itemQuantity, setItemQuantity] = useState("1")

  const handleAddItem = () => {
    if (itemName.trim() && Number.parseFloat(itemPrice) > 0) {
      const quantity = Number.parseInt(itemQuantity) || 1
      const totalPrice = Number.parseFloat(itemPrice) * quantity

      onAddItem({
        id: Date.now().toString(),
        name: itemName.trim(),
        price: totalPrice,
        quantity: quantity,
        pricePerUnit: Number.parseFloat(itemPrice),
        assignedTo: [],
      })
      setItemName("")
      setItemPrice("")
      setItemQuantity("1")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="itemName">Item Name</Label>
          <Input
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="itemPrice">Price Per Unit</Label>
            <Input
              id="itemPrice"
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="itemQuantity">Quantity</Label>
            <Input
              id="itemQuantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              placeholder="1"
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>
      <Button
        onClick={handleAddItem}
        disabled={!itemName.trim() || !(Number.parseFloat(itemPrice) > 0) || people.length === 0}
        className="w-full"
      >
        Add Item
      </Button>
    </div>
  )
}

