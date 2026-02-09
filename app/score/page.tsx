import ScoreBoardPage from '@/components/pages/score_board'
import React, { Suspense } from 'react'

const ScoreBoardContainer = () => {
  return (
    <Suspense>
      <ScoreBoardPage />
    </Suspense>
  )
}

export default ScoreBoardContainer
