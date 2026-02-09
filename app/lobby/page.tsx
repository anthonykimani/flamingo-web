import GamePin from '@/components/pages/game_pin'
import React, { Suspense } from 'react'

const GameLobby = () => {
  return (
    <div className="game-type-background h-full w-screen bg-cover bg-no-repeat p-1 sm:p-3 md:flex md:h-screen md:items-center md:justify-center">
      <Suspense>
        <GamePin />
      </Suspense>
    </div>
  )
}

export default GameLobby
