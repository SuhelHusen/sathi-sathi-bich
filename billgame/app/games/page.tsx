"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicTacToe } from "@/components/TicTacToe"
import { BoxGame } from "@/components/BoxGame"
import { Ludo } from "@/components/Ludo"
import { MathCompetition } from "@/components/MathCompetition"

export default function Games() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Games</h1>

      <Tabs defaultValue="tictactoe">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="tictactoe">Tic Tac Toe</TabsTrigger>
          <TabsTrigger value="boxgame">Box Game</TabsTrigger>
          <TabsTrigger value="ludo">Ludo</TabsTrigger>
          <TabsTrigger value="math">Math Game</TabsTrigger>
        </TabsList>

        <TabsContent value="tictactoe">
          <Card>
            <CardContent className="p-4 pt-6">
              <TicTacToe />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boxgame">
          <Card>
            <CardContent className="p-4 pt-6">
              <BoxGame />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ludo">
          <Card>
            <CardContent className="p-4 pt-6">
              <Ludo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="math">
          <Card>
            <CardContent className="p-4 pt-6">
              <MathCompetition />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

