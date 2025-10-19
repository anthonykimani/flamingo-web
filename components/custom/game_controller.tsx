'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { JoystickIcon, SquareIcon, StarIcon, CircleIcon, TriangleIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getQuizById } from '@/services/quiz_service'
import { IQuiz } from '@/interfaces/IQuiz'

// Icon mapping for answers
const ANSWER_ICONS = [SquareIcon, StarIcon, TriangleIcon, CircleIcon]


const GamePage = () => {
    const [quizData, setQuizData] = useState<IQuiz | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answersReceived, setAnswersReceived] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const quizId = searchParams.get('id')


    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) {
                setError('No quiz ID provided')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await getQuizById(quizId)
                setQuizData(response.payload)
                setLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load quiz')
                setLoading(false)
            }
        }

        fetchQuiz()
    }, [quizId])

    const handleNextQuestion = () => {
        if (!quizData) return

        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            // Reset answers for new question
            setAnswersReceived(Math.floor(Math.random() * 5)) // Random for demo
        } else {
            router.push("/score")
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl'>Loading quiz...</CardHeader>
                </Card>
            </div>
        )
    }

    // Error state
    if (error || !quizData) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl text-red-500'>
                        {error || 'Quiz not found'}
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const currentQuestion = quizData.questions[currentQuestionIndex]

    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-around '>
            <div className='w-full md:w-1/2 flex flex-col justify-center gap-10'>
                <Card>
                    <CardHeader className='text-3xl text-center'>
                        {currentQuestion.question}
                    </CardHeader>
                </Card>
                
                <div className='flex justify-between'>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {/* You can add timer logic here later */}
                        10
                    </div>
                    <Button
                        variant="active"
                        size="xl"
                    >
                        {answersReceived} Answers
                    </Button>
                </div>
                
                <div className='grid grid-cols-2 gap-2'>
                    {currentQuestion.answers.map((answer, index) => {
                        const IconComponent = ANSWER_ICONS[index % ANSWER_ICONS.length]
                        return (
                            <Button
                                key={answer.id}
                                leftIcon={<IconComponent size={32} />}
                                variant="active"
                                size="xl"
                            >
                                {answer.answer}
                            </Button>
                        )
                    })}
                </div>
                
                <div className='flex flex-col md:flex-row justify-between items-center mt-4 gap-2'>
                    <div className='text-white text-lg font-semibold'>
                        Question {currentQuestionIndex + 1} of {quizData.questions.length}
                    </div>
                    <Button
                        leftIcon={<JoystickIcon size={28} />}
                        variant="active"
                        size="xl"
                        onClick={handleNextQuestion}
                    >
                        {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GamePage