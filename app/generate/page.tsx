'use client'

import GenerateQuiz from '@/components/pages/generate_quiz'
import React, { Suspense } from 'react'

const GenerateQuizCointainer = () => {
  return (
    <Suspense>
      <GenerateQuiz />
    </Suspense>
  )
}

export default GenerateQuizCointainer
