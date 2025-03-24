"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Person } from "@/types"

type Debt = {
  from: string
  to: string
  amount: number
  settled: boolean
}

export default function Settlement() {
  const [people, setPeople] = useState<Person[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [newPersonName, setNewPersonName] = useState("")
  const [amounts, setAmounts] = useState<Record<string, number>>({})

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson = { id: Date.now().toString(), name: newPersonName.trim() }
      setPeople([...people, newPerson])
      setNewPersonName("")
    }
  }

  const handleAmountChange = (personId: string, value: string) => {
    const numValue = value === "" ? 0 : Number.parseFloat(value)
    setAmounts({
      ...amounts,
      [personId]: numValue,
    })
  }

  const calculateSettlement = () => {
    // Calculate total and average
    const total = Object.values(amounts).reduce((sum, amount) => sum + amount, 0)
    const average = total / people.length

    // Calculate how much each person owes or is owed
    const balances: Record<string, number> = {}
    people.forEach((person) => {
      const spent = amounts[person.id] || 0
      balances[person.id] = spent - average
    })

    // Create debts
    const newDebts: Debt[] = []
    const debtors = people.filter((p) => (balances[p.id] || 0) < 0).sort((a, b) => balances[a.id] - balances[b.id])
    const creditors = people.filter((p) => (balances[p.id] || 0) > 0).sort((a, b) => balances[b.id] - balances[a.id])

    let i = 0,
      j = 0
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]

      const debtorOwes = Math.abs(balances[debtor.id])
      const creditorIsOwed = balances[creditor.id]

      const amount = Math.min(debtorOwes, creditorIsOwed)

      if (amount > 0.01) {
        // Avoid tiny transactions
        newDebts.push({
          from: debtor.id,
          to: creditor.id,
          amount: Number.parseFloat(amount.toFixed(2)),
          settled: false,
        })
      }

      balances[debtor.id] += amount
      balances[creditor.id] -= amount

      if (Math.abs(balances[debtor.id]) < 0.01) i++
      if (Math.abs(balances[creditor.id]) < 0.01) j++
    }

    setDebts(newDebts)
  }

  const toggleSettled = (index: number) => {
    const newDebts = [...debts]
    newDebts[index].settled = !newDebts[index].settled
    setDebts(newDebts)
  }

  const getPersonName = (id: string) => {
    return people.find((p) => p.id === id)?.name || "Unknown"
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Settlement</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>People & Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="personName">Name</Label>
                  <Input
                    id="personName"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="Enter name"
                    onKeyDown={(e) => e.key === "Enter" && addPerson()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addPerson}>Add Person</Button>
                </div>
              </div>

              {people.length > 0 && (
                <div className="space-y-3 mt-4">
                  {people.map((person) => (
                    <div key={person.id} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Label htmlFor={`amount-${person.id}`}>{person.name}</Label>
                        <Input
                          id={`amount-${person.id}`}
                          type="number"
                          placeholder="Amount spent"
                          value={amounts[person.id] || ""}
                          onChange={(e) => handleAmountChange(person.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <Button onClick={calculateSettlement} className="w-full mt-4" disabled={people.length < 2}>
                    Calculate Settlement
                  </Button>
                </div>
              )}

              {people.length === 0 && <p className="text-muted-foreground text-sm">Add people to get started.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settlement Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {debts.length > 0 ? (
              <div className="space-y-3">
                {debts.map((debt, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg flex justify-between items-center ${
                      debt.settled ? "bg-muted line-through opacity-50" : ""
                    }`}
                  >
                    <div>
                      <span className="font-medium">{getPersonName(debt.from)}</span> pays{" "}
                      <span className="font-medium">{getPersonName(debt.to)}</span>
                      <div className="text-sm text-muted-foreground">${debt.amount.toFixed(2)}</div>
                    </div>
                    <Button
                      variant={debt.settled ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleSettled(index)}
                    >
                      {debt.settled ? "Undo" : "Mark Paid"}
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total Settled:</span>
                    <span>
                      $
                      {debts
                        .filter((d) => d.settled)
                        .reduce((sum, d) => sum + d.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Remaining:</span>
                    <span>
                      $
                      {debts
                        .filter((d) => !d.settled)
                        .reduce((sum, d) => sum + d.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Add people and their expenses, then calculate the settlement to see who owes what.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

