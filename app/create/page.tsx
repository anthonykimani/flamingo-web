'use client'

import ChooseCanvasType from '@/components/pages/choose_canvas_type'
import ChooseGameType from '@/components/pages/choose_game_type'
import CreateQuiz from '@/components/pages/create_quiz'
import NavigationBar from '@/components/navigation/navigation-bar'
import { CreateGameStep } from '@/enums/create_game_step'
import { GameMode } from '@/enums/game_mode'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const GameType = () => {
  const [stepper, setStepper] = useState<CreateGameStep>(CreateGameStep.GAMETYPE)
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.HANGOUTS)
  const [gameSession, setGameSession] = useState<any>(null)
  const router = useRouter()

  const handleGameTypeSelect = (selectedMode: GameMode) => {
    setGameMode(selectedMode)
    setStepper(CreateGameStep.GAMECANVAS)
  }

  const handleNextStep = () => {
    switch (stepper) {
      case CreateGameStep.GAMETYPE:
        setStepper(CreateGameStep.GAMECANVAS)
        break
      case CreateGameStep.GAMECANVAS:
        setStepper(CreateGameStep.GAMEFORM)
        break
      case CreateGameStep.GAMEFORM:
        // This will be handled by CreateQuiz onSave
        break
    }
  }

  const handleQuizSave = (session: any) => {
    setGameSession(session)
    // Navigate to lobby as host
    router.push(`/lobby?sessionId=${session.id}&gamePin=${session.gamePin}&host=true`)
  }

  const renderStep = () => {
    switch (stepper) {
      case CreateGameStep.GAMETYPE:
        return (
          <div className="game-type-background flex h-screen flex-col justify-around bg-cover bg-no-repeat p-3">
            <NavigationBar />
            <ChooseGameType onGameTypeSelect={handleGameTypeSelect} />
          </div>
        )
      case CreateGameStep.GAMECANVAS:
        return (
          <div className="canvas-type-background flex h-screen flex-col justify-around bg-cover bg-no-repeat p-3">
            <NavigationBar />
            <ChooseCanvasType gameMode={gameMode} onSelect={handleNextStep} />
          </div>
        )
      case CreateGameStep.GAMEFORM:
        return (
          <div className="quiz-form-background h-full w-screen bg-cover bg-no-repeat p-1 sm:p-3 md:flex md:h-screen md:items-center md:justify-center">
            <NavigationBar />
            <CreateQuiz gameMode={gameMode} onSave={handleQuizSave} />
          </div>
        )
    }
  }

  return renderStep()
}

export default GameType
