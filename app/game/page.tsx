import GamePage from '@/components/pages/game_controller'
import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

const GameContainter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
        <GamePage />
    </Suspense>
  )
}

export default GameContainter