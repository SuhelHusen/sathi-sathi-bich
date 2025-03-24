"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SquareSplitHorizontalIcon as SplitHorizontal, GamepadIcon, History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SavedItem = {
  id: string
  name: string
  date: string
  totalAmount: number
  type?: string
}

export default function Home() {
  const [savedBills, setSavedBills] = useState<SavedItem[]>([])
  const [savedSettlements, setSavedSettlements] = useState<SavedItem[]>([])

  useEffect(() => {
    // Load saved bills from localStorage
    const billsHistory = localStorage.getItem("billsHistory")
    if (billsHistory) {
      setSavedBills(JSON.parse(billsHistory))
    }

    // Load saved settlements from localStorage
    const settlementsHistory = localStorage.getItem("settlementsHistory")
    if (settlementsHistory) {
      setSavedSettlements(JSON.parse(settlementsHistory))
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const loadSavedBill = (id: string) => {
    // Set the current bill ID in localStorage
    localStorage.setItem("currentBillId", id)
    // The bill data itself is already in localStorage with its own key
  }

  const viewSettlement = (id: string) => {
    // We'll just show the settlement details in a dialog
    // This is a placeholder - in a real app, you might want to show more details
    alert("Settlement viewing is not implemented yet")
  }

  const deleteSavedItem = (id: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent click

    if (type === "bill") {
      // Remove the bill from localStorage
      localStorage.removeItem(`bill_${id}`)

      // Update the history
      const updatedBills = savedBills.filter((bill) => bill.id !== id)
      setSavedBills(updatedBills)
      localStorage.setItem("billsHistory", JSON.stringify(updatedBills))
    } else if (type === "settlement") {
      // Remove the settlement from localStorage
      localStorage.removeItem(`settlement_${id}`)

      // Update the history
      const updatedSettlements = savedSettlements.filter((settlement) => settlement.id !== id)
      setSavedSettlements(updatedSettlements)
      localStorage.setItem("settlementsHistory", JSON.stringify(updatedSettlements))
    }
  }

  return (
    <main className="container mx-auto py-10 px-4 flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-3xl font-bold text-center mb-10">Bill Game Harmony</h1>

      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        <Link href="/split-bill" className="w-full">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center">
              <SplitHorizontal className="h-16 w-16 mb-4 text-primary" />
              <h2 className="text-2xl font-semibold text-center">Split Bill</h2>
              <p className="text-center text-muted-foreground mt-2">Split expenses among friends easily</p>
            </CardContent>
          </Card>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center">
                <History className="h-16 w-16 mb-4 text-primary" />
                <h2 className="text-2xl font-semibold text-center">History</h2>
                <p className="text-center text-muted-foreground mt-2">View your saved bills and settlements</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>History</DialogTitle>
              <DialogDescription>Your previously saved bills and settlements</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="bills" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bills">Bills</TabsTrigger>
                <TabsTrigger value="settlements">Settlements</TabsTrigger>
              </TabsList>

              <TabsContent value="bills">
                <ScrollArea className="h-[50vh] mt-4">
                  {savedBills.length > 0 ? (
                    <div className="space-y-2">
                      {savedBills.map((bill) => (
                        <Link href="/split-bill/calculation" key={bill.id} onClick={() => loadSavedBill(bill.id)}>
                          <div className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent">
                            <div>
                              <div className="font-medium">{bill.name}</div>
                              <div className="text-sm text-muted-foreground">{formatDate(bill.date)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">${bill.totalAmount.toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => deleteSavedItem(bill.id, "bill", e)}
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-trash-2"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  <line x1="10" x2="10" y1="11" y2="17" />
                                  <line x1="14" x2="14" y1="11" y2="17" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No saved bills yet</p>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settlements">
                <ScrollArea className="h-[50vh] mt-4">
                  {savedSettlements.length > 0 ? (
                    <div className="space-y-2">
                      {savedSettlements.map((settlement) => (
                        <div key={settlement.id} className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <div className="font-medium">{settlement.name}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(settlement.date)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${settlement.totalAmount.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => deleteSavedItem(settlement.id, "settlement", e)}
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Delete</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-trash-2"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No saved settlements yet</p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Link href="/games" className="w-full">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center">
              <GamepadIcon className="h-16 w-16 mb-4 text-primary" />
              <h2 className="text-2xl font-semibold text-center">Games</h2>
              <p className="text-center text-muted-foreground mt-2">Play games while deciding who pays</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}

