'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { CircleIcon, SquareIcon, StarIcon, ThumbsUpIcon, TriangleIcon, XCircleIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getQuizById, submitAnswer } from '@/services/quiz_service'
import { IQuiz, IAnswer } from '@/interfaces/IQuiz'
import socketClient from '@/utils/socket.client'

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
    const [canAnswer, setCanAnswer] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get session and player info from URL params
    const sessionId = searchParams.get('sessionId') || ''
    const playerName = searchParams.get('playerName') || ''
    const quizId = searchParams.get('quizId') || searchParams.get('id') || ''

    // Connect to WebSocket and setup listeners
    useEffect(() => {
        if (!sessionId || !playerName) return

        const socket = socketClient.connect()
        
        socket.on('connect', () => {
            console.log('Player connected to WebSocket')
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('Player disconnected from WebSocket')
            setIsConnected(false)
        })

        // Listen for next question from host
        socketClient.onNextQuestion((data) => {
            console.log('Next question:', data)
            setCurrentQuestionIndex(data.questionIndex)
            setSelectedAnswer(null)
            setShowResult(false)
            setIsCorrect(false)
            setPointsEarned(0)
            setCanAnswer(true)
            setTimeLeft(10)
        })

        // Listen for show results from host
        socketClient.onQuestionResults((data) => {
            console.log('Question results:', data)
            // Results are already shown locally, this confirms from host
        })

        // Listen for game ended
        socketClient.onGameEnded((data) => {
            console.log('Game ended:', data)
            router.push(`/score?sessionId=${sessionId}&playerName=${playerName}&finalScore=${score}`)
        })

        // Listen for answer submission confirmation
        socketClient.onAnswerSubmitted((data) => {
            console.log('Answer submission confirmed:', data)
        })

        // Cleanup
        return () => {
            socketClient.off('next-question')
            socketClient.off('question-results')
            socketClient.off('game-ended')
            socketClient.off('answer-submitted')
        }
    }, [sessionId, playerName, router, score])

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

    // Timer countdown
    useEffect(() => {
        if (showResult || timeLeft === 0 || !quizData || !canAnswer) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up, mark as wrong if not answered
                    if (selectedAnswer === null && quizData && currentQuestionIndex < quizData.questions.length) {
                        handleAnswerSelect(quizData.questions[currentQuestionIndex].answers[0], true)
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, showResult, quizData, currentQuestionIndex, canAnswer, selectedAnswer])

    // Reset timer when moving to next question
    useEffect(() => {
        setTimeLeft(10)
    }, [currentQuestionIndex])

    const handleAnswerSelect = async (answer: IAnswer, timeout = false) => {
        if (selectedAnswer !== null || !quizData || !canAnswer) return

        const answerIndex = currentQuestion.answers.findIndex(a => a.id === answer.id)
        setSelectedAnswer(answerIndex)
        setCanAnswer(false)

        const correct = timeout ? false : answer.correctAnswer
        setIsCorrect(correct)

        let newStreak = answerStreak
        let points = 0

        if (correct) {
            newStreak = answerStreak + 1
            // Time-based scoring: faster answers get more points
            const timeBonus = Math.floor((timeLeft / 10) * 50)
            points = 100 + (newStreak * 50) + timeBonus
            setPointsEarned(points)
            setScore(prevScore => prevScore + points)
            setAnswerStreak(newStreak)
        } else {
            setPointsEarned(0)
            setAnswerStreak(0)
            newStreak = 0
        }

        // Submit answer to backend (HTTP)
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

                // Emit WebSocket event to notify host
                socketClient.submitAnswer({
                    gameSessionId: sessionId,
                    playerName: playerName,
                    questionId: currentQuestion.id,
                    answerId: answer.id,
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
        // Player doesn't control next question, wait for host
        // This button is just for display/feedback
        console.log('Waiting for host to move to next question...')
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

    // Show result screen (waiting for next question)
    if (showResult) {
        return (
            <div className='result-background h-screen bg-no-repeat bg-cover flex flex-col justify-around p-8'>
                {/* Connection Status */}
                <div className='absolute top-4 right-4'>
                    <span className='text-white text-sm'>
                        {isConnected ? '🟢 Connected' : '🔴 Reconnecting...'}
                    </span>
                </div>

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

                {/* Waiting for host */}
                <div className='flex flex-col items-center gap-2'>
                    <Card className='max-w-md'>
                        <CardHeader className='text-center'>
                            <div className='animate-pulse'>
                                <p className='text-lg font-semibold'>Waiting for next question...</p>
                                <p className='text-sm text-gray-600 mt-2'>
                                    The host will move to the next question
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        )
    }

    // Show question screen
    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-around p-8'>
            <div className='w-full md:w-1/2 flex flex-col justify-center gap-10'>
                {/* Connection Status */}
                <div className='absolute top-4 right-4'>
                    <span className='text-white text-sm'>
                        {isConnected ? '🟢 Connected' : '🔴 Reconnecting...'}
                    </span>
                </div>

                {/* Question */}
                <Card>
                    <CardHeader className='text-3xl text-center font-bold'>
                        {currentQuestion.question}
                    </CardHeader>
                </Card>

                {/* Score and Timer */}
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

                {/* Answer Options */}
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
                                disabled={selectedAnswer !== null || !canAnswer}
                            >
                            </Button>
                        )
                    })}
                </div>

                {/* Status Message */}
                {selectedAnswer !== null && (
                    <Card>
                        <CardHeader className='text-center'>
                            <p className='text-green-600 font-semibold'>Answer submitted! ✓</p>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default PlayGame