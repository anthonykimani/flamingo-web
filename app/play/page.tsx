import PlayGame from '@/components/pages/play_game'
import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

const PlayGameContainer = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <PlayGame />
        </Suspense>
    )
}

export default PlayGameContainer