"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"

type PlayerColor = "red" | "green" | "blue" | "yellow"
type PlayerState = {
  color: PlayerColor
  name: string
  position: number
  isHome: boolean
  hasWon: boolean
  pawns: number[]
}

const BOARD_SIZE = 52 // Total number of cells in the main track
const HOME_POSITION = -1

const PLAYER_COLORS: PlayerColor[] = ["red", "green", "blue", "yellow"]
const COLOR_CLASSES = {
  red: "bg-red-500 text-white border-red-700",
  green: "bg-green-500 text-white border-green-700",
  blue: "bg-blue-500 text-white border-blue-700",
  yellow: "bg-yellow-500 text-black border-yellow-700",
}

export function Ludo() {
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [numPlayers, setNumPlayers] = useState<number>(2)
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2", "Player 3", "Player 4"])
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState(0)
  const [diceRolled, setDiceRolled] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [selectedPawn, setSelectedPawn] = useState<number | null>(null)

  const startGame = () => {
    // Initialize players
    const initialPlayers: PlayerState[] = []
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({
        color: PLAYER_COLORS[i],
        name: playerNames[i],
        position: 0,
        isHome: true,
        hasWon: false,
        pawns: [HOME_POSITION, HOME_POSITION, HOME_POSITION, HOME_POSITION],
      })
    }
    setPlayers(initialPlayers)
    setCurrentPlayerIndex(0)
    setDiceValue(0)
    setDiceRolled(false)
    setWinner(null)
    setGameStarted(true)
  }

  const rollDice = () => {
    const value = Math.floor(Math.random() * 6) + 1
    setDiceValue(value)
    setDiceRolled(true)

    // Check if player can move any pawn
    const currentPlayer = players[currentPlayerIndex]
    const canMove = currentPlayer.pawns.some((pawnPos) => {
      // If pawn is at home and dice is 6, it can move
      if (pawnPos === HOME_POSITION && value === 6) return true
      // If pawn is on board, it can move
      if (pawnPos !== HOME_POSITION) return true
      return false
    })

    // If player can't move any pawn, move to next player after a delay
    if (!canMove) {
      setTimeout(() => {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % numPlayers)
        setDiceRolled(false)
      }, 1500)
    }
  }

  const movePawn = (pawnIndex: number) => {
    if (!diceRolled) return

    const currentPlayer = players[currentPlayerIndex]
    const pawnPosition = currentPlayer.pawns[pawnIndex]

    // If pawn is at home and dice is 6, move to start
    if (pawnPosition === HOME_POSITION) {
      if (diceValue === 6) {
        // Get starting position based on player color
        const startPosition = currentPlayerIndex * 13 // Each player starts at a different position

        const updatedPlayers = [...players]
        updatedPlayers[currentPlayerIndex].pawns[pawnIndex] = startPosition

        // Check if landed on another player's pawn
        checkForCapture(updatedPlayers, startPosition)

        setPlayers(updatedPlayers)
        setDiceRolled(false)
      }
    }
    // If pawn is already on board, move it
    else {
      const newPosition = (pawnPosition + diceValue) % BOARD_SIZE

      const updatedPlayers = [...players]
      updatedPlayers[currentPlayerIndex].pawns[pawnIndex] = newPosition

      // Check if landed on another player's pawn
      checkForCapture(updatedPlayers, newPosition)

      setPlayers(updatedPlayers)
      setDiceRolled(false)

      // If dice value is not 6, move to next player
      if (diceValue !== 6) {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % numPlayers)
      }
    }

    setSelectedPawn(null)
  }

  const checkForCapture = (updatedPlayers: PlayerState[], position: number) => {
    // Check if any other player's pawn is at this position
    for (let i = 0; i < updatedPlayers.length; i++) {
      if (i !== currentPlayerIndex) {
        // Skip current player
        const opponentPawns = updatedPlayers[i].pawns
        for (let j = 0; j < opponentPawns.length; j++) {
          if (opponentPawns[j] === position) {
            // Send that pawn back home
            updatedPlayers[i].pawns[j] = HOME_POSITION
          }
        }
      }
    }
  }

  const renderDice = () => {
    if (diceValue === 0) return null

    const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][diceValue - 1]
    return (
      <div className="p-2 bg-white rounded-lg shadow-md">
        <DiceIcon className="h-12 w-12 text-gray-800" />
      </div>
    )
  }

  const renderBoard = () => {
    // Create a traditional Ludo board
    return (
      <div className="relative w-full max-w-md aspect-square bg-gray-100 border-4 border-gray-800 rounded-lg overflow-hidden">
        {/* Red home (top left) */}
        <div className="absolute top-0 left-0 w-2/5 h-2/5 bg-red-200 border-r-4 border-b-4 border-gray-800 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-red-500 rounded-lg flex flex-wrap gap-2 p-2 items-center justify-center">
            {players.length > 0 &&
              players[0].pawns.map(
                (pos, idx) =>
                  pos === HOME_POSITION && (
                    <div
                      key={`red-${idx}`}
                      className="w-1/3 h-1/3 rounded-full bg-white border-2 border-red-700 cursor-pointer"
                      onClick={() => currentPlayerIndex === 0 && diceRolled && diceValue === 6 && movePawn(idx)}
                    />
                  ),
              )}
          </div>
        </div>

        {/* Green home (top right) */}
        <div className="absolute top-0 right-0 w-2/5 h-2/5 bg-green-200 border-l-4 border-b-4 border-gray-800 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-green-500 rounded-lg flex flex-wrap gap-2 p-2 items-center justify-center">
            {players.length > 1 &&
              players[1].pawns.map(
                (pos, idx) =>
                  pos === HOME_POSITION && (
                    <div
                      key={`green-${idx}`}
                      className="w-1/3 h-1/3 rounded-full bg-white border-2 border-green-700 cursor-pointer"
                      onClick={() => currentPlayerIndex === 1 && diceRolled && diceValue === 6 && movePawn(idx)}
                    />
                  ),
              )}
          </div>
        </div>

        {/* Blue home (bottom left) */}
        <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-blue-200 border-r-4 border-t-4 border-gray-800 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-blue-500 rounded-lg flex flex-wrap gap-2 p-2 items-center justify-center">
            {players.length > 2 &&
              players[2].pawns.map(
                (pos, idx) =>
                  pos === HOME_POSITION && (
                    <div
                      key={`blue-${idx}`}
                      className="w-1/3 h-1/3 rounded-full bg-white border-2 border-blue-700 cursor-pointer"
                      onClick={() => currentPlayerIndex === 2 && diceRolled && diceValue === 6 && movePawn(idx)}
                    />
                  ),
              )}
          </div>
        </div>

        {/* Yellow home (bottom right) */}
        <div className="absolute bottom-0 right-0 w-2/5 h-2/5 bg-yellow-200 border-l-4 border-t-4 border-gray-800 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-yellow-500 rounded-lg flex flex-wrap gap-2 p-2 items-center justify-center">
            {players.length > 3 &&
              players[3].pawns.map(
                (pos, idx) =>
                  pos === HOME_POSITION && (
                    <div
                      key={`yellow-${idx}`}
                      className="w-1/3 h-1/3 rounded-full bg-white border-2 border-yellow-700 cursor-pointer"
                      onClick={() => currentPlayerIndex === 3 && diceRolled && diceValue === 6 && movePawn(idx)}
                    />
                  ),
              )}
          </div>
        </div>

        {/* Center area */}
        <div className="absolute top-2/5 left-2/5 w-1/5 h-1/5 bg-white border-2 border-gray-800 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center text-lg font-bold">LUDO</div>
        </div>

        {/* Game track - simplified representation */}
        <div className="absolute top-2/5 left-0 w-2/5 h-1/5 flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`left-${i}`} className="flex-1 border border-gray-400 flex items-center justify-center">
              {renderPawnsAtPosition(i)}
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-2/5 w-1/5 h-2/5 flex flex-col">
          {[5, 6, 7, 8, 9].map((i) => (
            <div key={`top-${i}`} className="flex-1 border border-gray-400 flex items-center justify-center">
              {renderPawnsAtPosition(i)}
            </div>
          ))}
        </div>

        <div className="absolute top-2/5 right-0 w-2/5 h-1/5 flex">
          {[10, 11, 12, 13, 14].map((i) => (
            <div key={`right-${i}`} className="flex-1 border border-gray-400 flex items-center justify-center">
              {renderPawnsAtPosition(i)}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-2/5 w-1/5 h-2/5 flex flex-col">
          {[15, 16, 17, 18, 19].map((i) => (
            <div key={`bottom-${i}`} className="flex-1 border border-gray-400 flex items-center justify-center">
              {renderPawnsAtPosition(i)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPawnsAtPosition = (position: number) => {
    // Find all pawns at this position
    const pawnsAtPosition: { playerIndex: number; pawnIndex: number }[] = []

    players.forEach((player, playerIndex) => {
      player.pawns.forEach((pawnPos, pawnIndex) => {
        if (pawnPos === position) {
          pawnsAtPosition.push({ playerIndex, pawnIndex })
        }
      })
    })

    return (
      <div className="flex flex-wrap gap-1">
        {pawnsAtPosition.map(({ playerIndex, pawnIndex }) => (
          <div
            key={`p${playerIndex}-${pawnIndex}`}
            className={cn("w-3 h-3 rounded-full border cursor-pointer", COLOR_CLASSES[players[playerIndex].color])}
            onClick={() => {
              if (playerIndex === currentPlayerIndex && diceRolled) {
                movePawn(pawnIndex)
              }
            }}
          />
        ))}
      </div>
    )
  }

  const renderPlayerStatus = () => {
    return (
      <div className="space-y-2 mb-4">
        <h3 className="font-bold">Players:</h3>
        {players.map((player, idx) => (
          <div
            key={idx}
            className={cn(
              "p-2 border rounded-md flex justify-between",
              currentPlayerIndex === idx ? "border-primary" : "",
              player.hasWon ? "bg-green-100" : "",
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded-full", COLOR_CLASSES[player.color])}></div>
              <span>{player.name}</span>
            </div>
            <div>{player.pawns.filter((p) => p !== HOME_POSITION).length} pawns on board</div>
          </div>
        ))}
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="numPlayers">Number of Players (2-4)</Label>
          <Input
            id="numPlayers"
            type="number"
            min="2"
            max="4"
            value={numPlayers}
            onChange={(e) => setNumPlayers(Math.min(4, Math.max(2, Number.parseInt(e.target.value) || 2)))}
          />
        </div>

        {Array.from({ length: numPlayers }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Label htmlFor={`player${idx}`}>
              Player {idx + 1} Name ({PLAYER_COLORS[idx]})
            </Label>
            <Input
              id={`player${idx}`}
              value={playerNames[idx]}
              onChange={(e) => {
                const newNames = [...playerNames]
                newNames[idx] = e.target.value
                setPlayerNames(newNames)
              }}
            />
          </div>
        ))}

        <Button onClick={startGame} className="w-full">
          Start Game
        </Button>
      </div>
    )
  }

  return (
    <div>
      {winner && (
        <div className="mb-4 p-3 bg-green-100 border border-green-500 rounded-md text-center">
          <h3 className="font-bold text-lg">{winner} has won the game! 🎉</h3>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h3 className="font-bold mb-2">Game Board</h3>
          {renderBoard()}

          <div className="flex items-center gap-4 my-4">
            <div className="flex flex-col items-center">
              <p className="font-bold">Current Turn:</p>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  COLOR_CLASSES[players[currentPlayerIndex].color],
                )}
              >
                {players[currentPlayerIndex].name.charAt(0)}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="font-bold">Dice:</p>
              {renderDice()}
            </div>
          </div>

          <div className="space-x-2">
            <Button onClick={rollDice} disabled={diceRolled || !!winner}>
              Roll Dice
            </Button>

            <Button variant="outline" onClick={() => setGameStarted(false)}>
              New Game
            </Button>
          </div>
        </div>

        <div className="flex-1">{renderPlayerStatus()}</div>
      </div>
    </div>
  )
}

