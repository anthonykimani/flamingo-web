import PlayGame from '@/components/custom/play_game'
import React, { Suspense } from 'react'

const PlayGameContainer = () => {
    return (
        <Suspense>
            <PlayGame />
        </Suspense>
    )
}

export default PlayGameContainer