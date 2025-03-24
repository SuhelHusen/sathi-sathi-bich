"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Player = {
  name: string
  score: number
}

type Question = {
  num1: number
  num2: number
  operation: string
  answer: number
  options: number[]
}

// Function to generate a random math question
const generateQuestion = (): Question => {
  // Randomly choose operation
  const operations = ["+", "-", "*"]
  const operation = operations[Math.floor(Math.random() * operations.length)]

  let num1, num2, answer

  switch (operation) {
    case "+":
      num1 = Math.floor(Math.random() * 50) + 1
      num2 = Math.floor(Math.random() * 50) + 1
      answer = num1 + num2
      break
    case "-":
      num1 = Math.floor(Math.random() * 50) + 25
      num2 = Math.floor(Math.random() * num1) + 1
      answer = num1 - num2
      break
    case "*":
      num1 = Math.floor(Math.random() * 12) + 1
      num2 = Math.floor(Math.random() * 12) + 1
      answer = num1 * num2
      break
    default:
      num1 = 0
      num2 = 0
      answer = 0
  }

  // Generate wrong options
  const options = [answer]
  while (options.length < 3) {
    // Generate a wrong answer within a reasonable range
    let wrongAnswer
    if (operation === "*") {
      wrongAnswer = answer + (Math.floor(Math.random() * 20) - 10)
    } else {
      wrongAnswer = answer + (Math.floor(Math.random() * 20) - 10)
    }

    // Make sure it's not the correct answer and not already in options
    if (wrongAnswer !== answer && !options.includes(wrongAnswer) && wrongAnswer > 0) {
      options.push(wrongAnswer)
    }
  }

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  return {
    num1,
    num2,
    operation,
    answer,
    options,
  }
}

export function MathCompetition() {
  const [players, setPlayers] = useState<Player[]>([])
  const [numPlayers, setNumPlayers] = useState<number>(2)
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2"])
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [winner, setWinner] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState<number[]>([15, 15]) // Starting score for both players

  useEffect(() => {
    if (gameStarted && !winner) {
      setCurrentQuestion(generateQuestion())
    }
  }, [gameStarted, currentPlayerIndex, winner])

  const startGame = () => {
    // Initialize players
    const initialPlayers: Player[] = []
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({
        name: playerNames[i],
        score: 0,
      })
    }
    setPlayers(initialPlayers)
    setCurrentPlayerIndex(0)
    setWinner(null)
    setGameStarted(true)
    setScore([15, 15]) // Reset scores
    setCurrentQuestion(generateQuestion())
    setSelectedOption(null)
    setIsCorrect(null)
  }

  const handleAnswer = (selectedValue: number) => {
    if (!currentQuestion) return

    setSelectedOption(selectedValue)
    const correct = selectedValue === currentQuestion.answer
    setIsCorrect(correct)

    // Update score
    const newScores = [...score]
    if (correct) {
      // Increase current player's score
      newScores[currentPlayerIndex] += 1
    } else {
      // Decrease current player's score
      newScores[currentPlayerIndex] = Math.max(0, newScores[currentPlayerIndex] - 1)
    }
    setScore(newScores)

    // Check for winner (score reaches 0)
    if (newScores[currentPlayerIndex] <= 0) {
      setWinner(playerNames[(currentPlayerIndex + 1) % 2]) // Other player wins
    } else if (newScores[(currentPlayerIndex + 1) % 2] <= 0) {
      setWinner(playerNames[currentPlayerIndex]) // Current player wins
    } else {
      // Move to next player after a delay
      setTimeout(() => {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % 2)
        setSelectedOption(null)
        setIsCorrect(null)
        setCurrentQuestion(generateQuestion())
      }, 1500)
    }
  }

  const getOperationSymbol = (op: string) => {
    switch (op) {
      case "+":
        return "+"
      case "-":
        return "-"
      case "*":
        return "×"
      default:
        return op
    }
  }

  if (!gameStarted) {
    return (
      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="player1">Player 1 Name</Label>
          <Input
            id="player1"
            value={playerNames[0]}
            onChange={(e) => {
              const newNames = [...playerNames]
              newNames[0] = e.target.value
              setPlayerNames(newNames)
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="player2">Player 2 Name</Label>
          <Input
            id="player2"
            value={playerNames[1]}
            onChange={(e) => {
              const newNames = [...playerNames]
              newNames[1] = e.target.value
              setPlayerNames(newNames)
            }}
          />
        </div>

        <Button onClick={startGame} className="w-full">
          Start Game
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[80vh] flex flex-col bg-[#8b5d5f] text-white relative">
      {/* Top options */}
      <div className="flex justify-center gap-4 mt-8">
        {currentQuestion &&
          currentQuestion.options.map((option, idx) => (
            <div
              key={`top-${idx}`}
              className="bg-[#00b8d4] text-[#00b8d4] py-2 px-6 rounded-full border-4 border-white transform rotate-180"
            >
              <span className="transform rotate-180 inline-block text-2xl font-bold">{option}</span>
            </div>
          ))}
      </div>

      {/* Top divider */}
      <div className="w-full h-2 bg-[#00b8d4] my-8"></div>

      {/* Middle section - equation */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {currentQuestion && (
          <div className="text-center">
            <div className="text-6xl font-bold mb-8">
              {score[0]} {getOperationSymbol(currentQuestion.operation)} {score[1]}
            </div>

            <div className="text-8xl font-bold">
              {currentQuestion.num1} {getOperationSymbol(currentQuestion.operation)} {currentQuestion.num2}
            </div>
          </div>
        )}
      </div>

      {/* Player indicators */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex flex-col items-center justify-center",
            currentPlayerIndex === 0 ? "bg-white" : "bg-gray-300",
          )}
        >
          <span className="text-blue-500 font-bold">O</span>
          <span className="text-red-500 font-bold">O</span>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
          <span className="text-gray-800 font-bold">EXIT</span>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="w-full h-2 bg-red-500 mb-8"></div>

      {/* Bottom options - clickable */}
      <div className="flex justify-center gap-4 mb-8">
        {currentQuestion &&
          currentQuestion.options.map((option, idx) => (
            <button
              key={`bottom-${idx}`}
              className={cn(
                "bg-red-400 text-red-500 py-2 px-6 rounded-full border-4 border-white",
                selectedOption === option && isCorrect ? "bg-green-400" : "",
                selectedOption === option && !isCorrect ? "bg-red-600" : "",
              )}
              onClick={() => !selectedOption && handleAnswer(option)}
              disabled={selectedOption !== null}
            >
              <span className="text-2xl font-bold">{option}</span>
            </button>
          ))}
      </div>

      {/* Winner modal */}
      {winner && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-black text-center">
            <h2 className="text-2xl font-bold mb-4">{winner} Wins!</h2>
            <Button onClick={() => setGameStarted(false)}>New Game</Button>
          </div>
        </div>
      )}
    </div>
  )
}

