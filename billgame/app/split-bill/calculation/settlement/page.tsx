"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Person } from "@/types"
import { Check, ArrowRight, Save, Download } from "lucide-react"

type Debt = {
  from: string
  to: string
  amount: number
  settled: boolean
}

type PersonWithPayment = Person & {
  amountPaid: number
  amountOwed: number
  balance: number
}

export default function Settlement() {
  const router = useRouter()
  const [people, setPeople] = useState<PersonWithPayment[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<"payment" | "settlement">("payment")
  const [settlementName, setSettlementName] = useState("Settlement")

  useEffect(() => {
    // Load data from localStorage
    const storedPeople = localStorage.getItem("billPeople")
    const storedTotals = localStorage.getItem("billTotals")

    if (storedPeople && storedTotals) {
      const peopleData = JSON.parse(storedPeople)
      const totals = JSON.parse(storedTotals)

      // Initialize people with payment data
      const peopleWithPayment = peopleData.map((person: Person) => ({
        ...person,
        amountPaid: 0,
        amountOwed: totals[person.id] || 0,
        balance: -(totals[person.id] || 0), // Initially negative (owes money)
      }))

      setPeople(peopleWithPayment)
    } else {
      // If no data found, redirect back
      router.push("/split-bill")
    }

    setIsLoading(false)
  }, [router])

  const handlePaymentChange = (personId: string, value: string) => {
    const numValue = value === "" ? 0 : Number.parseFloat(value)

    setPeople(
      people.map((person) => {
        if (person.id === personId) {
          return {
            ...person,
            amountPaid: numValue,
            balance: numValue - person.amountOwed,
          }
        }
        return person
      }),
    )
  }

  const calculateSettlement = () => {
    // Calculate settlement based on balances
    const debtors = people.filter((p) => p.balance < 0).sort((a, b) => a.balance - b.balance)
    const creditors = people.filter((p) => p.balance > 0).sort((a, b) => b.balance - a.balance)

    const newDebts: Debt[] = []
    let i = 0,
      j = 0

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]

      const debtorOwes = Math.abs(debtor.balance)
      const creditorIsOwed = creditor.balance

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

      // Update balances
      debtors[i] = { ...debtor, balance: debtor.balance + amount }
      creditors[j] = { ...creditor, balance: creditor.balance - amount }

      if (Math.abs(debtors[i].balance) < 0.01) i++
      if (Math.abs(creditors[j].balance) < 0.01) j++
    }

    setDebts(newDebts)
    setStep("settlement")
  }

  const toggleSettled = (index: number) => {
    const newDebts = [...debts]
    newDebts[index].settled = !newDebts[index].settled
    setDebts(newDebts)
  }

  const getPersonName = (id: string) => {
    return people.find((p) => p.id === id)?.name || "Unknown"
  }

  const handleGoHome = () => {
    // Clear localStorage data
    localStorage.removeItem("billPeople")
    localStorage.removeItem("billItems")
    localStorage.removeItem("billTotals")
    router.push("/")
  }

  const saveSettlement = () => {
    const settlementId = Date.now().toString()
    const settlementData = {
      id: settlementId,
      name: settlementName,
      type: "settlement",
      people: people,
      debts: debts,
      date: new Date().toISOString(),
      totalAmount: debts.reduce((sum, debt) => sum + debt.amount, 0),
    }

    // Save the settlement data
    localStorage.setItem(`settlement_${settlementId}`, JSON.stringify(settlementData))

    // Update the settlements history
    const settlementsHistory = localStorage.getItem("settlementsHistory")
    const history = settlementsHistory ? JSON.parse(settlementsHistory) : []

    const historyEntry = {
      id: settlementId,
      name: settlementName,
      type: "settlement",
      date: settlementData.date,
      totalAmount: settlementData.totalAmount,
    }

    history.unshift(historyEntry) // Add to beginning of array
    localStorage.setItem("settlementsHistory", JSON.stringify(history))

    return settlementId
  }

  const exportSettlement = () => {
    const settlementId = saveSettlement()
    const settlementData = localStorage.getItem(`settlement_${settlementId}`)

    if (settlementData) {
      const blob = new Blob([settlementData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${settlementName.replace(/\s+/g, "_")}_${settlementId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-6 px-4">Loading...</div>
  }

  if (step === "payment") {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Enter Payments</h1>

        <Card className="mb-6">
          <CardContent className="p-4 pt-6">
            <div className="space-y-4">
              {people.map((person) => (
                <div key={person.id} className="space-y-1">
                  <Label htmlFor={`payment-${person.id}`}>
                    {person.name} (Owes: ${person.amountOwed.toFixed(2)})
                  </Label>
                  <Input
                    id={`payment-${person.id}`}
                    type="number"
                    placeholder="Amount paid"
                    value={person.amountPaid || ""}
                    onChange={(e) => handlePaymentChange(person.id, e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4 pt-6">
            <h2 className="text-lg font-semibold mb-3">Balance Summary</h2>
            <div className="space-y-2">
              {people.map((person) => (
                <div key={person.id} className="flex justify-between items-center">
                  <span>{person.name}</span>
                  <span className={`font-medium ${person.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {person.balance >= 0 ? "+" : ""}
                    {person.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full flex items-center justify-center gap-2" onClick={calculateSettlement}>
          Calculate Settlement
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settlement Plan</h1>
        <Input
          value={settlementName}
          onChange={(e) => setSettlementName(e.target.value)}
          className="max-w-[150px]"
          placeholder="Settlement Name"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => saveSettlement()} className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={exportSettlement} className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 pt-6">
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
                  <Button variant={debt.settled ? "outline" : "default"} size="sm" onClick={() => toggleSettled(index)}>
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
            <p className="text-muted-foreground text-sm">No settlement needed. Everyone is even!</p>
          )}
        </CardContent>
      </Card>

      <Button className="w-full flex items-center justify-center gap-2" onClick={handleGoHome}>
        Done
        <Check className="h-4 w-4" />
      </Button>
    </div>
  )
}

