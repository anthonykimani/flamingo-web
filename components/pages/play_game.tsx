'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import { IAnswer, IPlayer, IQuestion } from '@/interfaces/IQuiz'
import { getGameSession } from '@/services/quiz_service'
import socketClient from '@/utils/socket/socket.client'
import { CircleIcon, SquareIcon, StarIcon, TriangleIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ANSWER_CONFIG = [
    { Icon: TriangleIcon, color: 'bg-[#009900]', borderColor: 'border-[#006600]' },
    { Icon: CircleIcon, color: 'bg-[#FF9700]', borderColor: 'border-[#cc7800]' },
    { Icon: SquareIcon, color: 'bg-[#2819DB]', borderColor: 'border-[#1a0f8a]' },
    { Icon: StarIcon, color: 'bg-[#F14100]', borderColor: 'border-[#b33000]' }
]

const PlayGame = () => {
    const [question, setQuestion] = useState<IQuestion | null>(null)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [hasAnswered, setHasAnswered] = useState(false)
    const [timeLeft, setTimeLeft] = useState(10)
    const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
    const [playerScore, setPlayerScore] = useState(0)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0)
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [answerResult, setAnswerResult] = useState<{
        isCorrect: boolean;
        pointsEarned: number;
        currentStreak: number;
    } | null>(null)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
    const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])

    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('sessionId')
    const playerName = searchParams.get('playerName')

    const rejoinGame = () => {
        if (sessionId && playerName) {
            console.log('🔁 Re-joining game room after reconnect')
            socketClient.joinGame(sessionId, playerName, '')
        }
    }

    useEffect(() => {
        if (!sessionId || !playerName) {
            console.error('Missing sessionId or playerName')
            return
        }

        const socket = socketClient.connect()

        if (socket.connected && sessionId) {
            getGameSession(sessionId).then(response => {
                setGameState(response.payload.status as GameState)
            }).catch(console.error)
        }

        // Re-join game room on reconnect (screen-off recovery)
        socket.on('connect', () => {
            console.log('✅ Player WebSocket reconnected — rejoining game room')
            rejoinGame()
        })

        // Listen for countdown
        socket.on('countdown-tick', (data: { count: number }) => {
            console.log('⏰ Countdown:', data.count)
            setCountdown(data.count)
            setGameState(GameState.COUNTDOWN)
        })

        // Listen for question started
        socketClient.onQuestionStarted((data: {
            question: IQuestion;
            questionIndex: number;
            duration: number;
            startTime: Date;
            totalQuestions: number;
        }) => {
            console.log('📝 Question started:', data)
            setQuestion(data.question)
            setTimeLeft(data.duration)
            setCurrentQuestionNumber(data.questionIndex + 1)
            setTotalQuestions(data.totalQuestions)
            setSelectedAnswer(null)
            setHasAnswered(false)
            setAnswerResult(null)
            setGameState(GameState.IN_PROGRESS)
            setCountdown(null)
            setQuestionStartTime(new Date(data.startTime))
        })

        // Listen for time updates
        socket.on('time-update', (data: { timeLeft: number }) => {
            setTimeLeft(data.timeLeft)
        })

        // Listen for answer confirmation
        socketClient.onAnswerSubmitted((data: {
            success: boolean;
            isCorrect: boolean;
            pointsEarned: number;
            currentStreak: number;
            totalScore: number;
        }) => {
            console.log('✅ Answer submitted:', data)
            setAnswerResult({
                isCorrect: data.isCorrect,
                pointsEarned: data.pointsEarned,
                currentStreak: data.currentStreak
            })
            setPlayerScore(data.totalScore)
            setHasAnswered(true)
        })

        // Listen for question results
        socketClient.onQuestionResults((data: { leaderboard: any[] }) => {
            console.log('📊 Question results:', data)
            setLeaderboard(data.leaderboard)
            setGameState(GameState.RESULTS_READY)
        })

        // Listen for game ended
        socketClient.onGameEnded((data: { leaderboard: any[] }) => {
            console.log('🏁 Game ended:', data)
            router.push(`/score?sessionId=${sessionId}`)
        })

        // Listen for errors
        socketClient.onError((data: { message: string }) => {
            console.error('⚠️ Socket error:', data.message)
            alert(data.message)
        })

        return () => {
            socket.off('countdown-tick')
            socket.off('time-update')
            socketClient.off(SocketEvents.QUESTION_STARTED)
            socketClient.off(SocketEvents.ANSWER_SUBMITTED)
            socketClient.off(SocketEvents.QUESTION_RESULTS)
            socketClient.off(SocketEvents.GAME_ENDED)
            socketClient.off(SocketEvents.ERROR)
            socket.off('game-state-changed')
        }
    }, [sessionId, playerName, router])

    const handleAnswerSelect = async (answer: IAnswer) => {
        if (hasAnswered || !question || !sessionId || !playerName || !questionStartTime) return

        setSelectedAnswer(answer.id!)

        // Calculate time to answer
        const timeToAnswer = (new Date().getTime() - questionStartTime.getTime()) / 1000

        // Submit answer via WebSocket
        socketClient.submitAnswer({
            gameSessionId: sessionId,
            playerName: playerName,
            questionId: question.id!,
            answerId: answer.id!,
            timeToAnswer: Math.round(timeToAnswer)
        })
    }

    // FIX #2: Show countdown UI (like GamePage)
    if (countdown !== null && gameState === GameState.COUNTDOWN) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <div className='text-center'>
                    <div className='text-white text-9xl font-bold animate-pulse'>
                        {countdown}
                    </div>
                    <p className='text-white text-2xl mt-4'>Get Ready!</p>
                </div>
            </div>
        )
    }

    // FIX #4: Only show waiting screen for WAITING state, and make it clearer
    if (gameState === GameState.WAITING) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card className='w-full max-w-md mx-4'>
                    <CardHeader className='text-center'>
                        <div className='animate-pulse'>
                            <p className='text-2xl font-bold mb-4'>⏳ Loading Game...</p>
                            <p className='text-sm text-gray-600'>
                                Waiting for host to start the game
                            </p>
                            <div className='mt-4 text-xs text-gray-500'>
                                Player: <strong>{playerName}</strong>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // Show results screen
    if (gameState === GameState.RESULTS_READY) {
    return (
        <div className='result-background flex flex-col justify-center items-center h-screen bg-no-repeat bg-cover py-4 px-1'>
            <div className='w-full max-w-2xl space-y-6'>
                {/* Answer Result Card */}
                <Card className='bg-white/95 backdrop-blur-sm'>
                    <CardHeader className='text-center space-y-4 py-8'>
                        <h2 className='text-4xl font-bold'>
                            {answerResult?.isCorrect ? '✅ Correct!' : '❌ Wrong!'}
                        </h2>
                        
                        {answerResult && (
                            <>
                                <div className='text-6xl font-bold text-blue-600'>
                                    +{answerResult.pointsEarned}
                                </div>
                                <div className='flex items-center justify-center gap-6 text-lg'>
                                    <div className='font-oldschool'>
                                        Total: <span className='text-2xl text-blue-600'>{playerScore}</span>
                                    </div>
                                    {answerResult.currentStreak > 0 && (
                                        <div className='text-orange-600 font-oldschool'>
                                            🔥 {answerResult.currentStreak}x
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {!answerResult && hasAnswered && (
                            <div className='text-xl text-gray-600'>
                                Answer recorded! Calculating results...
                            </div>
                        )}
                        
                        {!hasAnswered && (
                            <div className='text-xl text-gray-600'>
                                Time's up!
                            </div>
                        )}
                    </CardHeader>
                </Card>

                {/* Leaderboard Card */}
                <Card className='bg-white/95 backdrop-blur-sm'>
                    <CardHeader className='py-6'>
                        <h3 className='text-2xl font-bold text-center mb-6'>Leaderboard</h3>
                        <div className='space-y-3'>
                            {leaderboard.length === 0 ? (
                                <p className='text-center text-gray-500'>Loading scores...</p>
                            ) : (
                                leaderboard.map((player, index) => (
                                    <div 
                                        key={player.id} 
                                        className={`
                                            flex items-center gap-4 p-4 rounded-lg
                                            ${player.playerName === playerName 
                                                ? 'bg-blue-100 border-2 border-blue-400' 
                                                : 'bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className='text-2xl font-bold w-8 text-center'>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </div>
                                        <h3 className='text-xl font-oldschool flex-1 truncate'>
                                            {player.playerName}
                                            {player.playerName === playerName && (
                                                <span className='text-sm text-blue-600 ml-2'>(You)</span>
                                            )}
                                        </h3>
                                        <div className='text-2xl font-bold text-slate-700'>
                                            {player.totalScore}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
    // Show question
    if (question && gameState === GameState.IN_PROGRESS) {
        return (
            <div className='game-pin-background flex flex-col justify-between h-screen bg-no-repeat bg-cover p-4'>
                {/* Header */}
                <div className='flex justify-between items-center'>
                    <div className='text-white text-xl font-bold'>
                        Question {currentQuestionNumber}/{totalQuestions}
                    </div>
                    <div className='text-white text-2xl font-bold bg-black/50 px-4 py-2 rounded'>
                        ⏱️ {timeLeft}s
                    </div>
                    <div className='text-white text-xl font-bold'>
                        Score: {playerScore}
                    </div>
                </div>

                {/* Question */}
                <Card className='w-full'>
                    <CardHeader className='text-center text-2xl font-bold'>
                        {question.question}
                    </CardHeader>
                </Card>

                {/* Answers Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {question.answers?.map((answer, index) => {
                        const { Icon, color, borderColor } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
                        const isSelected = selectedAnswer === answer.id

                        return (
                            <Button
                                key={answer.id}
                                onClick={() => handleAnswerSelect(answer)}
                                disabled={hasAnswered}
                                leftIcon={<Icon size={32} color="white" weight="fill" />}
                                className={`
                                    ${color} 
                                    border-2 ${borderColor} border-b-[6px] border-r-[6px]
                                    ${isSelected ? 'ring-4 ring-white' : ''}
                                    ${hasAnswered ? 'opacity-50 cursor-not-allowed active:border-b-[6px] active:border-r-[6px]' : 'hover:scale-105 active:border-b-2 active:border-r-2'}
                                    min-h-[80px] sm:min-h-[100px] text-white text-lg sm:text-xl font-bold transition-all text-left
                                `}
                                variant="active"
                                size="xl"
                            >
                                {answer.answer}
                            </Button>
                        )
                    })}
                </div>

                {/* Status Message */}
                <div className='text-center'>
                    {hasAnswered ? (
                        <Card>
                            <CardHeader>
                                <p className='text-lg font-oldschool'>
                                    Answer submitted! ✅ Waiting for results...
                                </p>
                            </CardHeader>
                        </Card>
                    ) : (
                        <p className='text-white text-lg'>
                            Select your answer!
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Fallback loading state
    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
            <Card>
                <CardHeader className='text-2xl'>
                    <div className='animate-pulse'>Connecting...</div>
                </CardHeader>
            </Card>
        </div>
    )
}

export default PlayGame