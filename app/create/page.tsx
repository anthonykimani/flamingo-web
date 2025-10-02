'use client'

import ChooseCanvasType from '@/components/custom/choose_canvas_type';
import ChooseGameType from '@/components/custom/choose_game_type'
import CreateQuiz from '@/components/custom/create_quiz';
import { CreateGameStep } from '@/enums/create_game_step';
import React, { useState } from 'react'

const GameType = () => {
  const [stepper, setStepper] = useState<CreateGameStep>(CreateGameStep.GAMETYPE);
  const [gameData, setGameData] = useState({
    gameType: null,
    canvasData: null,
    formData: null
  })

  const handleNextStep = () => {
    switch (stepper) {
      case CreateGameStep.GAMETYPE:
        setStepper(CreateGameStep.GAMECANVAS)
        break
      case CreateGameStep.GAMECANVAS:
        setStepper(CreateGameStep.GAMEFORM)
        break
      case CreateGameStep.GAMEFORM:
        break
    }
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
          <div className='quiz-form-background h-screen bg-no-repeat bg-cover flex justify-center items-center p-3'>
            <CreateQuiz />
          </div>
        )
    }
  }
  return (
    renderStep()
  )
}

export default GameType