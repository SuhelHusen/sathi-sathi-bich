"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type BoxType = "tick" | "cross" | null
type BoxState = {
  type: BoxType
  selected: boolean
  revealed: boolean
}

export function BoxGame() {
  const [numBoxes, setNumBoxes] = useState<number>(4)
  const [numCrosses, setNumCrosses] = useState<number>(1)
  const [boxes, setBoxes] = useState<BoxState[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [allRevealed, setAllRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startGame = () => {
    if (numBoxes < 2) {
      setError("Number of boxes must be at least 2")
      return
    }

    if (numCrosses < 1) {
      setError("Number of crosses must be at least 1")
      return
    }

    if (numCrosses >= numBoxes) {
      setError("Number of crosses must be less than number of boxes")
      return
    }

    setError(null)

    // Create array with the right number of ticks and crosses
    const boxTypes: BoxType[] = [...Array(numCrosses).fill("cross"), ...Array(numBoxes - numCrosses).fill("tick")]

    // Shuffle the array
    for (let i = boxTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[boxTypes[i], boxTypes[j]] = [boxTypes[j], boxTypes[i]]
    }

    // Create box states
    const newBoxes = boxTypes.map((type) => ({
      type,
      selected: false,
      revealed: false,
    }))

    setBoxes(newBoxes)
    setGameStarted(true)
    setAllRevealed(false)
  }

  const selectBox = (index: number) => {
    if (allRevealed) return

    const newBoxes = [...boxes]
    // Toggle selection
    newBoxes[index].selected = !newBoxes[index].selected
    setBoxes(newBoxes)
  }

  const revealBoxes = () => {
    const newBoxes = boxes.map((box) => ({
      ...box,
      revealed: true,
    }))
    setBoxes(newBoxes)
    setAllRevealed(true)
  }

  const resetGame = () => {
    setGameStarted(false)
    setBoxes([])
    setAllRevealed(false)
  }

  // Calculate grid columns based on number of boxes
  const getGridCols = () => {
    if (numBoxes <= 4) return 2
    if (numBoxes <= 9) return 3
    return 4
  }

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numBoxes">Number of Boxes (Players)</Label>
            <Input
              id="numBoxes"
              type="number"
              min="2"
              value={numBoxes}
              onChange={(e) => setNumBoxes(Number.parseInt(e.target.value) || 2)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numCrosses">Number of Crosses (Losers)</Label>
            <Input
              id="numCrosses"
              type="number"
              min="1"
              max={numBoxes - 1}
              value={numCrosses}
              onChange={(e) => setNumCrosses(Number.parseInt(e.target.value) || 1)}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button onClick={startGame} className="w-full">
            Start Game
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <div
            className={`grid grid-cols-${getGridCols()} gap-4 mb-6`}
            style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}
          >
            {boxes.map((box, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all",
                  box.selected && !box.revealed ? "border-primary bg-primary/10" : "border-muted-foreground",
                  box.revealed && box.type === "cross" ? "bg-red-100 border-red-500" : "",
                  box.revealed && box.type === "tick" ? "bg-green-100 border-green-500" : "",
                )}
                onClick={() => selectBox(index)}
              >
                {box.revealed && box.type === "tick" && <Check className="h-12 w-12 text-green-600" />}
                {box.revealed && box.type === "cross" && <X className="h-12 w-12 text-red-600" />}
                {!box.revealed && <span className="text-2xl font-bold">{index + 1}</span>}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={revealBoxes} disabled={allRevealed} className="flex-1">
              Reveal Boxes
            </Button>
            <Button onClick={resetGame} variant="outline" className="flex-1">
              New Game
            </Button>
          </div>

          {allRevealed && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-bold text-lg mb-2">Results:</h3>
              <p>
                {boxes.filter((box) => box.selected && box.type === "cross").length > 0
                  ? "Selected players with crosses will pay!"
                  : "No one with a cross was selected!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

