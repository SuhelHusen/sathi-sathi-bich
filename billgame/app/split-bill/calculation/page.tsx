"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ItemInput } from "@/components/ItemInput"
import { BillTable } from "@/components/BillTable"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Item, Person } from "@/types"
import { Receipt, Undo2, RefreshCw, Save, Download, UserPlus, UserMinus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CalculationDetails() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPersonName, setNewPersonName] = useState("")
  const [billName, setBillName] = useState("My Bill")
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => {
    // Check if we're loading a saved bill
    const currentBillId = localStorage.getItem("currentBillId")

    if (currentBillId) {
      // Load the saved bill
      const savedBill = localStorage.getItem(`bill_${currentBillId}`)
      if (savedBill) {
        const billData = JSON.parse(savedBill)
        setPeople(billData.people)
        setItems(billData.items)
        setBillName(billData.name)
        localStorage.removeItem("currentBillId") // Clear after loading
      } else {
        // If bill not found, load people from localStorage
        loadPeopleFromStorage()
      }
    } else {
      // Normal flow - load people from localStorage
      loadPeopleFromStorage()
    }

    setIsLoading(false)
  }, [router])

  const loadPeopleFromStorage = () => {
    const storedPeople = localStorage.getItem("billPeople")
    const storedBillName = localStorage.getItem("billName")

    if (storedBillName) {
      setBillName(storedBillName)
    }

    if (storedPeople) {
      setPeople(JSON.parse(storedPeople))
    } else {
      // If no people found, redirect back to split-bill
      router.push("/split-bill")
    }
  }

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, { id: Date.now().toString(), name: newPersonName.trim() }])
      setNewPersonName("")
    }
  }

  const removePerson = (id: string) => {
    // Remove person from people array
    setPeople(people.filter((person) => person.id !== id))

    // Also remove this person from any items they're assigned to
    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((personId) => personId !== id),
      })),
    )
  }

  const addItem = (item: Item) => {
    setItems([...items, item])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (updatedItem: Item) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  // Calculate totals
  const calculateTotals = () => {
    const personTotals: Record<string, number> = {}

    // Initialize totals for each person
    people.forEach((person) => {
      personTotals[person.id] = 0
    })

    // Calculate each person's share for each item
    items.forEach((item) => {
      const assignedCount = item.assignedTo.length
      if (assignedCount > 0) {
        const pricePerPerson = item.price / assignedCount
        item.assignedTo.forEach((personId) => {
          personTotals[personId] += pricePerPerson
        })
      }
    })

    return personTotals
  }

  const handleGoToSettlement = () => {
    if (items.length > 0) {
      // Save the bill first
      saveBill()

      // Store items and calculated totals in localStorage
      localStorage.setItem("billItems", JSON.stringify(items))
      localStorage.setItem("billTotals", JSON.stringify(calculateTotals()))
      router.push("/split-bill/calculation/settlement")
    }
  }

  const undoLastItem = () => {
    if (items.length > 0) {
      const newItems = [...items]
      const removedItem = newItems.pop()
      setItems(newItems)

      // Store the removed item in case we want to implement a redo feature later
      localStorage.setItem("lastRemovedItem", JSON.stringify(removedItem))
    }
  }

  const startNew = () => {
    // This will be triggered by the alert dialog confirmation
    setItems([])
  }

  const saveBill = () => {
    const billId = Date.now().toString()
    const billData = {
      id: billId,
      name: billName,
      people: people,
      items: items,
      date: new Date().toISOString(),
      totalAmount: items.reduce((sum, item) => sum + item.price, 0),
    }

    // Save the bill data
    localStorage.setItem(`bill_${billId}`, JSON.stringify(billData))

    // Update the bills history
    const billsHistory = localStorage.getItem("billsHistory")
    const history = billsHistory ? JSON.parse(billsHistory) : []

    const historyEntry = {
      id: billId,
      name: billName,
      date: billData.date,
      totalAmount: billData.totalAmount,
    }

    history.unshift(historyEntry) // Add to beginning of array
    localStorage.setItem("billsHistory", JSON.stringify(history))

    return billId
  }

  const exportBillToFile = () => {
    const billId = saveBill()
    const billData = localStorage.getItem(`bill_${billId}`)

    if (billData) {
      const blob = new Blob([billData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${billName.replace(/\s+/g, "_")}_${billId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-6 px-4">Loading...</div>
  }

  const totals = calculateTotals()
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Items</h1>
        <Input
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
          className="max-w-[150px]"
          placeholder="Bill Name"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={undoLastItem}
          disabled={items.length === 0}
          className="flex items-center gap-1"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Start New
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all items you've added. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={startNew}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Person</DialogTitle>
              <DialogDescription>Add a new person to split the bill with</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Input
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Enter name"
                onKeyDown={(e) => e.key === "Enter" && addPerson()}
              />
              <Button onClick={addPerson} disabled={!newPersonName.trim()}>
                Add
              </Button>
            </div>
            <ScrollArea className="h-[200px] mt-4">
              <div className="space-y-2">
                {people.map((person) => (
                  <div key={person.id} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{person.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => removePerson(person.id)} className="h-8 w-8 p-0">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 ml-auto">
              <Save className="h-4 w-4" />
              Save Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Bill</DialogTitle>
              <DialogDescription>Save your bill for future reference</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="saveBillName">Bill Name</Label>
                <Input
                  id="saveBillName"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  placeholder="Enter bill name"
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    saveBill()
                    setShowSaveDialog(false)
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={exportBillToFile} className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 pt-6">
          <ItemInput people={people} onAddItem={addItem} />

          {items.length > 0 ? (
            <BillTable
              items={items}
              people={people}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              onRemovePerson={removePerson}
            />
          ) : (
            <p className="text-muted-foreground text-sm mt-4">No items added yet. Add an item to get started.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4 pt-6">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <div className="space-y-2">
            {Object.entries(totals).map(([personId, amount]) => {
              const person = people.find((p) => p.id === personId)
              return person ? (
                <div key={personId} className="flex justify-between items-center">
                  <span>{person.name}</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              ) : null
            })}

            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoToSettlement}
        disabled={items.length === 0}
      >
        Go to Settlement
        <Receipt className="h-4 w-4" />
      </Button>
    </div>
  )
}

