'use client'

import ChooseCanvasType from '@/components/custom/choose_canvas_type';
import ChooseGameType from '@/components/custom/choose_game_type'
import CreateQuiz from '@/components/custom/create_quiz';
import { CreateGameStep } from '@/enums/create_game_step';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const GameType = () => {
  const [stepper, setStepper] = useState<CreateGameStep>(CreateGameStep.GAMETYPE);
  const [gameSession, setGameSession] = useState<any>(null)
  const router = useRouter()

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
    // Navigate to lobby with game session
    router.push(`/lobby?sessionId=${session.id}&gamePin=${session.gamePin}`)
  }

  const renderStep = () => {
    switch (stepper) {
      case CreateGameStep.GAMETYPE:
        return (
          <div className='game-type-background h-screen bg-no-repeat bg-cover flex justify-center items-center p-3'>
            <ChooseGameType onComplete={handleNextStep} />
          </div>
        )
      case CreateGameStep.GAMECANVAS:
        return (
          <div className='canvas-type-background h-screen bg-no-repeat bg-cover flex justify-center items-center p-3'>
            <ChooseCanvasType onSelect={handleNextStep} />
          </div>
        )
      case CreateGameStep.GAMEFORM:
        return (
          <div className='quiz-form-background h-full md:h-screen w-screen bg-no-repeat bg-cover md:flex md:justify-center md:items-center p-1 sm:p-3'>
            <CreateQuiz onSave={handleQuizSave} />
          </div>
        )
    }
  }

  return renderStep()
}

export default GameType