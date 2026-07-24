import GamePin from '@/components/pages/game_pin'
import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

const GameLobby = () => {
    return (
        <div className='game-type-background h-full md:h-screen w-screen bg-no-repeat bg-cover md:flex md:justify-center md:items-center p-1 sm:p-3'>
            <Suspense fallback={<PageLoader />}>
                <GamePin />
            </Suspense>
        </div>
    )
}

export default GameLobby