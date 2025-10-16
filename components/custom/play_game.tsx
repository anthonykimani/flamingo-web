'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { CircleIcon, SquareIcon, StarIcon, ThumbsUpIcon, TriangleIcon, XCircleIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getQuizById, submitAnswer } from '@/services/quiz_service'
import { IQuiz, IAnswer } from '@/interfaces/IQuiz'

// Icon mapping for answers with colors
const ANSWER_CONFIG = [
    { Icon: SquareIcon, color: 'bg-[#009900]' },
    { Icon: StarIcon, color: 'bg-[#FF9700]' },
    { Icon: TriangleIcon, color: 'bg-[#2819DB]' },
    { Icon: CircleIcon, color: 'bg-[#F14100]' }
]

const PlayGame = () => {
    const [quizData, setQuizData] = useState<IQuiz | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [score, setScore] = useState(0)
    const [answerStreak, setAnswerStreak] = useState(0)
    const [pointsEarned, setPointsEarned] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(10)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get session and player info from URL params
    const sessionId = searchParams.get('sessionId') || ''
    const playerName = searchParams.get('playerName') || ''
    const quizId = searchParams.get('quizId') || searchParams.get('id') || 'a8a4f067-a6aa-4fc6-9d3c-2a5d21df45e2'

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

    useEffect(() => {
        if (showResult || timeLeft === 0 || !quizData) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up, mark as wrong (select first answer as default)
                    if (quizData && currentQuestionIndex < quizData.questions.length) {
                        handleAnswerSelect(quizData.questions[currentQuestionIndex].answers[0])
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, showResult, quizData, currentQuestionIndex])

    // Reset timer when moving to next question
    useEffect(() => {
        setTimeLeft(10)
    }, [currentQuestionIndex])

    const handleAnswerSelect = async (answer: IAnswer) => {
        if (selectedAnswer !== null || !quizData) return

        const answerIndex = currentQuestion.answers.findIndex(a => a.id === answer.id)
        setSelectedAnswer(answerIndex)

        const correct = answer.correctAnswer
        setIsCorrect(correct)

        let newStreak = answerStreak
        let points = 0

        if (correct) {
            newStreak = answerStreak + 1
            points = 100 + (newStreak * 50)
            setPointsEarned(points)
            setScore(prevScore => prevScore + points)
            setAnswerStreak(newStreak)
        } else {
            setPointsEarned(0)
            setAnswerStreak(0)
            newStreak = 0
        }

        // Submit answer to backend only if we have session and player info
        if (sessionId && playerName && currentQuestion.id && answer.id) {
            try {
                await submitAnswer({
                    gameSessionId: sessionId,
                    playerName: playerName,
                    questionId: currentQuestion.id,
                    answerId: answer.id,
                    isCorrect: correct,
                    pointsEarned: points,
                    answerStreak: newStreak,
                    timeToAnswer: 10 - timeLeft
                })
            } catch (error) {
                console.error('Failed to submit answer:', error)
            }
        }

        setTimeout(() => {
            setShowResult(true)
        }, 500)
    }

    const handleNextQuestion = () => {
        if (!quizData) return

        if (currentQuestionIndex < quizData.questions.length - 1) {
            // Move to next question
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedAnswer(null)
            setShowResult(false)
            setIsCorrect(false)
            setPointsEarned(0)
        } else {
            // Quiz finished, go to final score
            if (sessionId) {
                router.push(`/score?sessionId=${sessionId}&playerName=${playerName}&finalScore=${score}`)
            } else {
                router.push(`/score`)
            }
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

    // Show result screen
    if (showResult) {
        return (
            <div className='result-background h-screen bg-no-repeat bg-cover flex flex-col justify-around p-8'>
                <Card>
                    <CardHeader className='text-3xl text-center font-bold'>
                        {isCorrect ? 'Correct! 🎉' : 'Wrong Answer'}
                    </CardHeader>
                </Card>

                <div className='w-full flex justify-center items-center'>
                    <Button
                        centerIcon={
                            isCorrect ? (
                                <ThumbsUpIcon size={64} weight="fill" color='white' />
                            ) : (
                                <XCircleIcon size={64} weight="fill" color='white' />
                            )
                        }
                        variant="active"
                        size="resultButton"
                        className={isCorrect ? 'bg-[#009900]' : 'bg-[#F14100]'}
                    />
                </div>

                <div className='flex justify-between items-center'>
                    <Button
                        variant="active"
                        size="xl"
                    >
                        Answer Streak: {answerStreak}
                    </Button>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {answerStreak}
                    </div>
                </div>

                {isCorrect && (
                    <Card>
                        <CardHeader className='text-4xl text-center font-bold text-green-600'>
                            + {pointsEarned}
                        </CardHeader>
                    </Card>
                )}

                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-white mb-4'>
                        Total Score: {score}
                    </h2>
                    <h4 className='text-xl text-white'>
                        Question {currentQuestionIndex + 1} of {quizData.questions.length}
                    </h4>
                </div>

                <div className='flex justify-center'>
                    <Button
                        variant="active"
                        size="xl"
                        onClick={handleNextQuestion}
                        className='text-xl px-8'
                    >
                        {currentQuestionIndex < quizData.questions.length - 1
                            ? 'Next Question'
                            : 'View Final Score'}
                    </Button>
                </div>
            </div>
        )
    }

    // Show question screen
    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-around p-8'>
            <div className='w-full md:w-1/2 flex flex-col justify-center gap-10'>
                <Card>
                    <CardHeader className='text-3xl text-center font-bold'>
                        {currentQuestion.question}
                    </CardHeader>
                </Card>

                <div className='flex justify-between items-center'>
                    <Button
                        variant="active"
                        size="xl"
                    >
                        Score: {score}
                    </Button>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {timeLeft}
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    {currentQuestion.answers.map((answer, index) => {
                        const { Icon, color } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
                        const isSelected = selectedAnswer === index

                        return (
                            <Button
                                key={answer.id || index}
                                centerIcon={<Icon size={48} color='white' weight='fill' />}
                                variant="active"
                                size="gameanswer"
                                className={`${color} ${isSelected ? 'ring-4 ring-white' : ''} transition-all`}
                                onClick={() => handleAnswerSelect(answer)}
                                disabled={selectedAnswer !== null}
                            >
                            </Button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default PlayGame