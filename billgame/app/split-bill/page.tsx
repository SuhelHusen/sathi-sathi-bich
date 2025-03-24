"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PersonInput } from "@/components/PersonInput"
import type { Person } from "@/types"
import { ArrowRight, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SplitBill() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [newPersonName, setNewPersonName] = useState("")
  const [importError, setImportError] = useState("")
  const [billName, setBillName] = useState("My Bill")

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, { id: Date.now().toString(), name: newPersonName.trim() }])
      setNewPersonName("")
    }
  }

  const removePerson = (id: string) => {
    setPeople(people.filter((person) => person.id !== id))
  }

  const handleContinue = () => {
    if (people.length >= 2) {
      // Store people in localStorage to access in the calculation details page
      localStorage.setItem("billPeople", JSON.stringify(people))
      localStorage.setItem("billName", billName)
      router.push("/split-bill/calculation")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const billData = JSON.parse(content)

        // Validate the file has the expected structure
        if (billData.people && Array.isArray(billData.people) && billData.items && Array.isArray(billData.items)) {
          // Store the data in localStorage
          const billId = Date.now().toString()
          localStorage.setItem(`bill_${billId}`, content)
          localStorage.setItem("currentBillId", billId)

          // Update history
          const historyEntry = {
            id: billId,
            name: billData.name || "Imported Bill",
            date: new Date().toISOString(),
            totalAmount: billData.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0),
          }

          const billsHistory = localStorage.getItem("billsHistory")
          const history = billsHistory ? JSON.parse(billsHistory) : []
          history.unshift(historyEntry)
          localStorage.setItem("billsHistory", JSON.stringify(history))

          // Navigate to calculation page
          router.push("/split-bill/calculation")
        } else {
          setImportError("Invalid bill file format")
        }
      } catch (error) {
        setImportError("Error parsing file")
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Split Bill</h1>

      <div className="mb-4">
        <Label htmlFor="billName">Bill Name</Label>
        <Input
          id="billName"
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
          placeholder="Enter bill name"
          className="mt-1"
        />
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="personName">Add Person</Label>
                <Input
                  id="personName"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Enter name"
                  onKeyDown={(e) => e.key === "Enter" && addPerson()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addPerson}>Add</Button>
              </div>
            </div>

            <div className="space-y-2">
              {people.map((person) => (
                <PersonInput key={person.id} person={person} onRemove={removePerson} />
              ))}
              {people.length === 0 && (
                <p className="text-muted-foreground text-sm">No people added yet. Add someone to get started.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-6">
        <Button
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handleContinue}
          disabled={people.length < 2}
        >
          Continue to Add Items
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Bill</DialogTitle>
              <DialogDescription>Upload a previously exported bill file</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Input type="file" accept=".json" onChange={handleFileUpload} />
              {importError && <p className="text-destructive text-sm mt-2">{importError}</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

