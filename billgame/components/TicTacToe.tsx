"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Player = "X" | "O" | null
type Board = Player[]

export function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Player | "Draw" | null>(null)

  const checkWinner = (board: Board): Player | "Draw" | null => {
    // Check rows
    for (let i = 0; i < 9; i += 3) {
      if (board[i] && board[i] === board[i + 1] && board[i] === board[i + 2]) {
        return board[i]
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[i] && board[i] === board[i + 3] && board[i] === board[i + 6]) {
        return board[i]
      }
    }

    // Check diagonals
    if (board[0] && board[0] === board[4] && board[0] === board[8]) {
      return board[0]
    }
    if (board[2] && board[2] === board[4] && board[2] === board[6]) {
      return board[2]
    }

    // Check for draw
    if (board.every((cell) => cell !== null)) {
      return "Draw"
    }

    return null
  }

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        {winner ? (
          <div className="text-xl font-bold">{winner === "Draw" ? "It's a draw!" : `Player ${winner} wins!`}</div>
        ) : (
          <div className="text-lg">
            Current player: <span className="font-bold">{currentPlayer}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-20 w-20 text-2xl font-bold"
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !!winner}
          >
            {cell}
          </Button>
        ))}
      </div>

      <Button onClick={resetGame}>Reset Game</Button>
    </div>
  )
}

