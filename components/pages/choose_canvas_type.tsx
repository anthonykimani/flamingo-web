'use client'

import React from 'react'
import { Button } from '../ui/button'
import {
  FilePlusIcon,
  RankingIcon,
  RobotIcon,
  StrategyIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useRouter } from 'next/navigation'
import { GameMode } from '@/enums/game_mode'

const ChooseCanvasType = ({ gameMode, onSelect }: { gameMode: GameMode; onSelect: () => void }) => {
  const router = useRouter()

  const handleGenerate = () => {
    router.push(`/generate?gameMode=${gameMode}`)
  }

  return (
    <div className="flex h-1/2 flex-col items-center justify-around">
      <h1 className="xsm:text-5xl text-center font-[Oi] text-3xl text-white [-webkit-text-stroke:1.5px_black] sm:text-6xl sm:[-webkit-text-stroke:2px_black]">
        Create New Game
      </h1>
      <div className="flex w-full flex-col justify-center sm:flex-row">
        <Card className="m-2 flex cursor-pointer flex-row" onClick={handleGenerate}>
          <CardHeader>
            <RobotIcon size={32} />
          </CardHeader>
          <CardContent className="flex flex-col">
            <CardTitle>Generate Game</CardTitle>
            <CardDescription>Create an AI-assisted game</CardDescription>
          </CardContent>
        </Card>

        <Card className="m-2 flex cursor-pointer flex-row" onClick={onSelect}>
          <CardHeader>
            <FilePlusIcon size={32} />
          </CardHeader>
          <CardContent className="flex flex-col">
            <CardTitle>Blank Canvas</CardTitle>
            <CardDescription>Create game from scratch</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChooseCanvasType
