'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { JoystickIcon, SquareIcon, StarIcon, CircleIcon, TriangleIcon, UserIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSessionByGamePin, getLeaderboard, getQuizById, updateGame } from '@/services/quiz_service'
import { IPlayer, IQuiz } from '@/interfaces/IQuiz'
import { GameState } from '@/enums/game_state'
import socketClient from '@/utils/socket.client'

// Icon mapping for answers
const ANSWER_CONFIG = [
    { Icon: SquareIcon, color: 'bg-[#009900]' },
    { Icon: StarIcon, color: 'bg-[#FF9700]' },
    { Icon: TriangleIcon, color: 'bg-[#2819DB]' },
    { Icon: CircleIcon, color: 'bg-[#F14100]' }
]

const GamePage = () => {
    const [quizData, setQuizData] = useState<IQuiz | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answersReceived, setAnswersReceived] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [timeLeft, setTimeLeft] = useState(10)
    const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])
    const [playersAnswered, setPlayersAnswered] = useState<Set<string>>(new Set())
    const [isConnected, setIsConnected] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const gamePinId = searchParams.get("gamePin")
    const sessionId = searchParams.get("sessionId")

    // Connect to WebSocket and setup listeners
    useEffect(() => {
        const socket = socketClient.connect()
        
        socket.on('connect', () => {
            console.log('Host connected to WebSocket')
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('Host disconnected from WebSocket')
            setIsConnected(false)
        })

        // Listen for player answers in real-time
        socketClient.onPlayerAnswered((data) => {
            console.log('Player answered:', data)
            setPlayersAnswered(prev => new Set([...prev, data.playerName]))
            setAnswersReceived(prev => prev + 1)
        })

        // Cleanup
        return () => {
            socketClient.off('player-answered')
        }
    }, [])

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!gamePinId) {
                setError('No gamePin ID provided')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const gamePinData = await getGameSessionByGamePin(gamePinId)
                const response = await getQuizById(gamePinData.payload.quiz.id)
                setQuizData(response.payload)
                setLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load quiz')
                setLoading(false)
            }
        }

        fetchQuiz()
    }, [gamePinId])

    // Timer countdown
    useEffect(() => {
        if (showResult || timeLeft === 0 || !quizData || !sessionId) return

        const timer = setInterval(async () => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0
                }
                return prev - 1
            })

            if (timeLeft === 1) {
                try {
                    // Fetch leaderboard when timer ends
                    const leaderboardResult = await getLeaderboard(sessionId)
                    setLeaderboard(leaderboardResult.payload)
                    
                    // Update game state
                    await updateGame(sessionId, GameState.RESULTS_READY)
                    
                    // Emit WebSocket event to show results to all players
                    if (quizData.questions[currentQuestionIndex]?.id) {
                        socketClient.showResults(sessionId, quizData.questions[currentQuestionIndex].id)
                    }
                    
                    // Show results on host screen
                    setShowResult(true)
                } catch (error) {
                    console.error('Failed to fetch leaderboard:', error)
                }
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, showResult, quizData, currentQuestionIndex, sessionId])

    // Reset timer and answer tracking when moving to next question
    useEffect(() => {
        setTimeLeft(10)
        setPlayersAnswered(new Set())
        setAnswersReceived(0)
    }, [currentQuestionIndex])

    const handleNextQuestion = async () => {
        if (!quizData || !sessionId) return

        setShowResult(false)

        if (currentQuestionIndex < quizData.questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1
            setCurrentQuestionIndex(nextIndex)
            
            // Emit WebSocket event for next question
            socketClient.nextQuestion(sessionId, nextIndex)
            
            // Update game state
            await updateGame(sessionId, GameState.IN_PROGRESS)
        } else {
            // Game finished
            await updateGame(sessionId, GameState.COMPLETED)
            
            // Emit game ended event
            socketClient.endGame(sessionId)
            
            // Navigate to final score
            router.push(`/score?sessionId=${sessionId}`)
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
                    <CardHeader className='text-3xl text-center'>
                        Scoreboard
                    </CardHeader>
                </Card>
                
                <div className='flex flex-col items-center gap-3'>
                    {leaderboard.length === 0 ? (
                        <p className='text-white text-xl'>No players yet...</p>
                    ) : (
                        leaderboard.map((player, index) => (
                            <div key={player.id} className='flex items-center justify-center gap-5 w-full max-w-2xl'>
                                <div className='text-white text-2xl font-bold w-8'>{index + 1}</div>
                                <Card className='active:border-b-6 active:border-r-6'>
                                    <CardHeader className='justify-center items-center px-10'>
                                        <UserIcon size={32} />
                                    </CardHeader>
                                </Card>
                                <h3 className='text-white text-xl text-center flex-1'>{player.playerName}</h3>
                                <h3 className='font-[Oi] text-white [text-stroke:_2px_black] text-3xl'>
                                    {player.totalScore}
                                </h3>
                            </div>
                        ))
                    )}
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
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-around'>
            <div className='w-full md:w-1/2 flex flex-col justify-center gap-10 p-4'>
                {/* Connection Status */}
                <div className='absolute top-4 right-4'>
                    <span className='text-white text-sm'>
                        {isConnected ? '🟢 Live' : '🔴 Offline'}
                    </span>
                </div>

                {/* Question */}
                <Card>
                    <CardHeader className='text-3xl text-center'>
                        {currentQuestion.question}
                    </CardHeader>
                </Card>

                {/* Timer and Answers Count */}
                <div className='flex justify-between items-center'>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {timeLeft}
                    </div>
                    <Button
                        variant="active"
                        size="xl"
                    >
                        {answersReceived} Answers
                    </Button>
                </div>

                {/* Answer Options */}
                <div className='grid grid-cols-2 gap-2'>
                    {currentQuestion.answers.map((answer, index) => {
                        const { Icon, color } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
                        return (
                            <Button
                                key={answer.id}
                                leftIcon={<Icon size={32} color="white" weight="fill" />}
                                variant="active"
                                className={`${color} text-2xl text-white transition-all`}
                                size="gameanswer"
                                disabled
                            >
                                {answer.answer}
                            </Button>
                        )
                    })}
                </div>

                {/* Progress and Controls */}
                <div className='flex flex-col md:flex-row justify-between items-center mt-4 gap-2'>
                    <div className='text-white text-lg font-semibold'>
                        Question {currentQuestionIndex + 1} of {quizData.questions.length}
                    </div>
                    <Button
                        leftIcon={<JoystickIcon size={28} />}
                        variant="active"
                        size="xl"
                        onClick={handleNextQuestion}
                        disabled={timeLeft > 0}
                    >
                        {timeLeft > 0 
                            ? `Wait ${timeLeft}s` 
                            : currentQuestionIndex < quizData.questions.length - 1 
                                ? 'Next Question' 
                                : 'Finish Quiz'}
                    </Button>
                </div>

                {/* Players Who Answered (Real-time) */}
                {playersAnswered.size > 0 && (
                    <Card>
                        <CardHeader>
                            <p className='text-sm text-gray-600'>Players who answered:</p>
                            <div className='flex flex-wrap gap-2 mt-2'>
                                {Array.from(playersAnswered).map((playerName) => (
                                    <span 
                                        key={playerName}
                                        className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'
                                    >
                                        {playerName} ✓
                                    </span>
                                ))}
                            </div>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default GamePage