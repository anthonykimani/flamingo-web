'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { CircleIcon, SquareIcon, StarIcon, ThumbsUpIcon, TriangleIcon, XCircleIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getQuizById } from '@/services/quiz_service'
import { IQuiz, IAnswer, IQuestion } from '@/interfaces/IQuiz'
import { GameState } from '@/enums/game_state'
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
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)

    // Backend-managed state
    const [playerStats, setPlayerStats] = useState({
        totalScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        correctAnswers: 0,
        wrongAnswers: 0
    })
    const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(10)
    const [currentQuestion, setCurrentQuestion] = useState<IQuestion | null>(null)
    const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false)
    const [answerResult, setAnswerResult] = useState<{
        isCorrect: boolean;
        pointsEarned: number;
    } | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    // Get session and player info from URL params
    const sessionId = searchParams.get('sessionId') || ''
    const playerName = searchParams.get('playerName') || ''
    const gamePin = searchParams.get('gamePin') || ''
    const quizId = searchParams.get('quizId') || ''

    // Fetch quiz data
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

    // Remove local countdown timer - backend controls it now
    // useEffect for countdown is NO LONGER NEEDED

    // Connect to WebSocket and setup listeners
    useEffect(() => {
        if (!sessionId || !playerName) return

        const socket = socketClient.connect()

        if (socket.connected) {
            console.log('✅ Already connected to WebSocket')
            setIsConnected(true)
        }

        socket.on('connect', () => {
            console.log('✅ Player connected to WebSocket')
            setIsConnected(true)

            // Join the game when connected
            socketClient.joinGame(sessionId, playerName)
        })

        socket.on('disconnect', () => {
            console.log('❌ Player disconnected from WebSocket')
            setIsConnected(false)
        })

        // Listen for game started event (from lobby)
        socketClient.onGameStarted((data) => {
            console.log('🚀 Game started:', data)
            setGameState(GameState.IN_PROGRESS)
            setCurrentQuestionIndex(0)
            setCurrentQuestion(data.question)
            setTimeLeft(data.timeLeft)
        })

        // Listen for joined game confirmation (includes current state for rejoining)
        socketClient.onJoinedGame((data) => {
            console.log('🎮 Joined game:', data)
            setGameState(data.gameState)
            setCurrentQuestionIndex(data.currentQuestionIndex)
            setTimeLeft(data.timeLeft)
            setCurrentQuestion(data.currentQuestion)
            setPlayerStats(data.playerStats)
            setHasAnsweredCurrent(data.hasAnsweredCurrent)
        })

        // Listen for next question from host
        socketClient.onNextQuestion((data) => {
            console.log('➡️ Next question:', data)
            setCurrentQuestionIndex(data.questionIndex)
            setCurrentQuestion(data.question)
            setTimeLeft(data.timeLeft)
            setHasAnsweredCurrent(false)
            setAnswerResult(null)
            setSelectedAnswer(null)
            setGameState(GameState.IN_PROGRESS)
        })

        // Listen for real-time timer updates from backend
        socket.on('time-update', (data) => {
            setTimeLeft(data.timeLeft)
        })

        // Listen for answer submission confirmation
        socketClient.onAnswerSubmitted((data) => {
            console.log('✅ Answer confirmed:', data)
            setAnswerResult({
                isCorrect: data.isCorrect,
                pointsEarned: data.pointsEarned
            })
            setPlayerStats(prev => ({
                ...prev,
                totalScore: data.newScore,
                currentStreak: data.currentStreak
            }))
            setHasAnsweredCurrent(true)
        })

        // Listen for question results from host
        socketClient.onQuestionResults((data) => {
            console.log('📊 Question results:', data)
            setGameState(GameState.RESULTS_READY)
        })

        // Listen for game ended
        socketClient.onGameEnded((data) => {
            console.log('🏁 Game ended:', data)
            router.push(`/score?sessionId=${sessionId}&playerName=${playerName}&finalScore=${playerStats.totalScore}`)
        })

        // Cleanup
        return () => {
            socketClient.off('next-question')
            socketClient.off('question-results')
            socketClient.off('game-ended')
            socketClient.off('answer-submitted')
            socketClient.off('question-started')
            socketClient.off('time-update')
        }
    }, [sessionId, playerName, router, playerStats.totalScore])

    const handleAnswerSelect = async (answer: IAnswer) => {
        if (hasAnsweredCurrent || !currentQuestion || gameState !== GameState.IN_PROGRESS) return

        setSelectedAnswer(answer.id!)

        // Submit to backend - it will validate and calculate everything
        socketClient.submitAnswer({
            gameSessionId: sessionId,
            playerName,
            questionId: currentQuestion.id!,
            answerId: answer.id!,
            timeToAnswer: 10 - timeLeft
        })
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


    // Connection waiting
    if (!isConnected) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl'>Connecting to game server...</CardHeader>
                </Card>
            </div>
        )
    }

    // Waiting for game to start
    if (gameState === GameState.WAITING || gameState === GameState.CREATED) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl text-center'>
                        <div className='animate-pulse'>
                            <p>Waiting for host to start the game...</p>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // Show countdown screen before question starts
    if ((gameState === GameState.COUNTDOWN || countdown !== null) && countdown && countdown > 0) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex flex-col justify-center items-center gap-8'>
                <Card className='max-w-md'>
                    <CardHeader className='text-center'>
                        <h3 className='text-2xl font-bold'>
                            {currentQuestion?.question}
                        </h3>
                    </CardHeader>
                </Card>

                <div className='text-center'>
                    <div className='text-white text-9xl font-bold animate-pulse mb-4'>
                        {countdown}
                    </div>
                    <p className='text-white text-3xl font-semibold'>Get Ready!</p>
                </div>

                <div className='text-white text-xl'>
                    Current Score: {playerStats.totalScore}
                </div>
            </div>
        )
    }

    // Show result screen (waiting for next question)
    if (gameState === GameState.RESULTS_READY && answerResult) {
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
                        {answerResult.isCorrect ? 'Correct! 🎉' : 'Wrong Answer'}
                    </CardHeader>
                </Card>

                <div className='w-full flex justify-center items-center'>
                    <Button
                        centerIcon={
                            answerResult.isCorrect ? (
                                <ThumbsUpIcon size={64} weight="fill" color='white' />
                            ) : (
                                <XCircleIcon size={64} weight="fill" color='white' />
                            )
                        }
                        variant="active"
                        size="resultButton"
                        className={answerResult.isCorrect ? 'bg-[#009900]' : 'bg-[#F14100]'}
                    />
                </div>

                <div className='flex justify-between items-center'>
                    <Button variant="active" size="xl">
                        Answer Streak: {playerStats.currentStreak}
                    </Button>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {playerStats.currentStreak}
                    </div>
                </div>

                {answerResult.isCorrect && (
                    <Card>
                        <CardHeader className='text-4xl text-center font-bold text-green-600'>
                            + {answerResult.pointsEarned}
                        </CardHeader>
                    </Card>
                )}

                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-white mb-4'>
                        Total Score: {playerStats.totalScore}
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

    // Show "waiting for results" if player answered but results not shown yet
    if (hasAnsweredCurrent && gameState === GameState.IN_PROGRESS) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card className='max-w-md'>
                    <CardHeader className='text-center'>
                        <div className='animate-pulse'>
                            <p className='text-xl font-semibold mb-2'>Answer Submitted! ✓</p>
                            <p className='text-gray-600'>
                                Waiting for other players and results...
                            </p>
                            <div className='mt-4 text-sm text-gray-500'>
                                Current Score: {playerStats.totalScore}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // Show question screen
    if (!currentQuestion) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl'>Loading question...</CardHeader>
                </Card>
            </div>
        )
    }

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
                    <Button variant="active" size="xl">
                        Score: {playerStats.totalScore}
                    </Button>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {timeLeft}
                    </div>
                </div>

                {/* Answer Options */}
                <div className='grid grid-cols-2 gap-4'>
                    {currentQuestion.answers.map((answer, index) => {
                        const { Icon, color } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
                        const isSelected = selectedAnswer === answer.id

                        return (
                            <Button
                                key={answer.id || index}
                                centerIcon={<Icon size={48} color='white' weight='fill' />}
                                variant="active"
                                size="gameanswer"
                                className={`${color} ${isSelected ? 'ring-4 ring-white' : ''} transition-all`}
                                onClick={() => handleAnswerSelect(answer)}
                                disabled={hasAnsweredCurrent || gameState !== GameState.IN_PROGRESS}
                            >
                            </Button>
                        )
                    })}
                </div>

                {/* Status Message */}
                {selectedAnswer && !hasAnsweredCurrent && (
                    <Card>
                        <CardHeader className='text-center'>
                            <p className='text-blue-600 font-semibold'>Submitting answer...</p>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default PlayGame