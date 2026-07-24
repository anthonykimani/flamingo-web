'use client'

import GenerateQuiz from '@/components/pages/generate_quiz'
import { SignInGate } from '@/components/auth/sign-in-gate'
import { Suspense } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

const GenerateQuizCointainer = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInGate>
        <GenerateQuiz />
      </SignInGate>
    </Suspense>
  )
}

export default GenerateQuizCointainer