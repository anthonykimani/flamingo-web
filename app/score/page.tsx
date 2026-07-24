import ScoreBoardPage from '@/components/pages/score_board'
import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

const ScoreBoardContainer = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <ScoreBoardPage />
        </Suspense>
    )
}

export default ScoreBoardContainer