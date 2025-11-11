'use client'

import GenerateQuiz from '@/components/custom/generate_quiz'
import React, { Suspense } from 'react'

const GenerateQuizCointainer = () => {
  return (
    <Suspense>
        <GenerateQuiz />
    </Suspense>
  )
}

export default GenerateQuizCointainer