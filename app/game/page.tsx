import GamePage from '@/components/custom/game_controller'
import React, { Suspense } from 'react'

const GameContainter = () => {
  return (
    <Suspense>
        <GamePage />
    </Suspense>
  )
}

export default GameContainter