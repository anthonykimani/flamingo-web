import GamePin from '@/components/custom/game_pin'
import React, { Suspense } from 'react'

const GameLobby = () => {
    return (
        <div className='game-type-background h-full md:h-screen w-screen bg-no-repeat bg-cover md:flex md:justify-center md:items-center p-1 sm:p-3'>
            <Suspense>
                <GamePin />
            </Suspense>
        </div>
    )
}

export default GameLobby