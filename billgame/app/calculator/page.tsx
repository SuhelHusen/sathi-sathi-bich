"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CalculatorButton } from "@/components/CalculatorButton"

export default function Calculator() {
  const [display, setDisplay] = useState("0")
  const [currentValue, setCurrentValue] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const clearAll = () => {
    setDisplay("0")
    setCurrentValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = Number.parseFloat(display)

    if (currentValue === null) {
      setCurrentValue(display)
    } else if (operator) {
      const result = calculate(Number.parseFloat(currentValue), inputValue, operator)
      setDisplay(String(result))
      setCurrentValue(String(result))
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b
      case "-":
        return a - b
      case "×":
        return a * b
      case "÷":
        return a / b
      default:
        return b
    }
  }

  const handleEquals = () => {
    if (!currentValue || !operator) return

    const inputValue = Number.parseFloat(display)
    const result = calculate(Number.parseFloat(currentValue), inputValue, operator)

    setDisplay(String(result))
    setCurrentValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  const handlePercentage = () => {
    const value = Number.parseFloat(display) / 100
    setDisplay(String(value))
  }

  const toggleSign = () => {
    const value = Number.parseFloat(display) * -1
    setDisplay(String(value))
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Calculator</h1>

      <Card>
        <CardContent className="p-4">
          <div className="bg-muted p-4 rounded-lg mb-4 text-right">
            <div className="text-3xl font-medium overflow-x-auto whitespace-nowrap">{display}</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <CalculatorButton onClick={clearAll} className="bg-orange-500 hover:bg-orange-600">
              AC
            </CalculatorButton>
            <CalculatorButton onClick={toggleSign} className="bg-gray-500 hover:bg-gray-600">
              +/-
            </CalculatorButton>
            <CalculatorButton onClick={handlePercentage} className="bg-gray-500 hover:bg-gray-600">
              %
            </CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation("÷")}
              className={`bg-amber-500 hover:bg-amber-600 ${operator === "÷" ? "ring-2 ring-white" : ""}`}
            >
              ÷
            </CalculatorButton>

            <CalculatorButton onClick={() => inputDigit("7")}>7</CalculatorButton>
            <CalculatorButton onClick={() => inputDigit("8")}>8</CalculatorButton>
            <CalculatorButton onClick={() => inputDigit("9")}>9</CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation("×")}
              className={`bg-amber-500 hover:bg-amber-600 ${operator === "×" ? "ring-2 ring-white" : ""}`}
            >
              ×
            </CalculatorButton>

            <CalculatorButton onClick={() => inputDigit("4")}>4</CalculatorButton>
            <CalculatorButton onClick={() => inputDigit("5")}>5</CalculatorButton>
            <CalculatorButton onClick={() => inputDigit("6")}>6</CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation("-")}
              className={`bg-amber-500 hover:bg-amber-600 ${operator === "-" ? "ring-2 ring-white" : ""}`}
            >
              -
            </CalculatorButton>

            <CalculatorButton onClick={() => inputDigit("1")}>1</CalculatorButton>
            <CalculatorButton onClick={() => inputDigit("2")}>2</CalculatorButton>
            <CalculatorButton onClick={() => inputDigit("3")}>3</CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation("+")}
              className={`bg-amber-500 hover:bg-amber-600 ${operator === "+" ? "ring-2 ring-white" : ""}`}
            >
              +
            </CalculatorButton>

            <CalculatorButton onClick={() => inputDigit("0")} className="col-span-2">
              0
            </CalculatorButton>
            <CalculatorButton onClick={inputDecimal}>.</CalculatorButton>
            <CalculatorButton onClick={handleEquals} className="bg-amber-500 hover:bg-amber-600">
              =
            </CalculatorButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

