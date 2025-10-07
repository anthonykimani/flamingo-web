import GamePin from '@/components/custom/game_pin'
import React from 'react'

const GameLobby = () => {
    return (
        <div className='start-screen-background h-full md:h-screen w-screen bg-no-repeat bg-cover md:flex md:justify-center md:items-center p-1 sm:p-3'>
            <GamePin />
        </div>
    )
}

export default GameLobby