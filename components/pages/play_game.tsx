'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import { IAnswer, IPlayer, IQuestion } from '@/interfaces/IQuiz'
import { getGameSession } from '@/services/quiz_service'
import socketClient from '@/utils/socket/socket.client'
import { CircleIcon, SquareIcon, StarIcon, TriangleIcon, CheckCircleIcon, XCircleIcon, FireIcon, ClockIcon, HourglassIcon } from '@phosphor-icons/react'
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

        socket.on('connect', () => {
            console.log('✅ Player WebSocket reconnected — rejoining game room')
            rejoinGame()
        })

        socket.on('countdown-tick', (data: { count: number }) => {
            console.log('⏰ Countdown:', data.count)
            setCountdown(data.count)
            setGameState(GameState.COUNTDOWN)
        })

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

        socket.on('time-update', (data: { timeLeft: number }) => {
            setTimeLeft(data.timeLeft)
        })

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

        socketClient.onQuestionResults((data: { leaderboard: any[] }) => {
            console.log('📊 Question results:', data)
            setLeaderboard(data.leaderboard)
            setGameState(GameState.RESULTS_READY)
        })

        socketClient.onGameEnded((data: { leaderboard: any[] }) => {
            console.log('🏁 Game ended:', data)
            router.push(`/score?sessionId=${sessionId}`)
        })

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

        const timeToAnswer = (new Date().getTime() - questionStartTime.getTime()) / 1000

        socketClient.submitAnswer({
            gameSessionId: sessionId,
            playerName: playerName,
            questionId: question.id!,
            answerId: answer.id!,
            timeToAnswer: Math.round(timeToAnswer)
        })
    }

    if (countdown !== null && gameState === GameState.COUNTDOWN) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <div className='text-center animate-fadeIn'>
                    <div className='text-white text-9xl font-bold'>
                        {countdown}
                    </div>
                    <p className='text-white text-2xl font-oldschool mt-4'>Get Ready!</p>
                </div>
            </div>
        )
    }

    if (gameState === GameState.WAITING) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card className='w-full max-w-md mx-4 bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px]'>
                    <CardHeader className='text-center'>
                        <div className='animate-fadeIn'>
                            <div className='flex justify-center mb-4'>
                                <HourglassIcon size={48} weight="fill" className='text-slate-600' />
                            </div>
                            <p className='text-2xl font-oldschool mb-4 text-slate-800'>Loading Game...</p>
                            <p className='text-sm text-slate-500'>
                                Waiting for host to start the game
                            </p>
                            <div className='mt-4 text-xs text-slate-400'>
                                Player: <strong className='text-slate-700'>{playerName}</strong>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (gameState === GameState.RESULTS_READY) {
    return (
        <div className='result-background flex justify-center items-center h-screen bg-no-repeat bg-cover p-4'>
            <div className='w-full max-w-2xl'>
                <div className='bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] overflow-hidden'>
                    {answerResult && (
                        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 ${answerResult.isCorrect ? 'bg-green-50 border-b-2 border-green-200' : 'bg-red-50 border-b-2 border-red-200'}`}>
                            <div className='flex items-center gap-3'>
                                {answerResult.isCorrect ? (
                                    <CheckCircleIcon size={28} weight="fill" className='text-green-500 shrink-0' />
                                ) : (
                                    <XCircleIcon size={28} weight="fill" className='text-red-500 shrink-0' />
                                )}
                                <div>
                                    <p className='text-lg font-bold text-slate-800'>
                                        {answerResult.isCorrect ? 'Correct!' : 'Wrong!'}
                                    </p>
                                    <div className='flex items-center gap-3 text-xs text-slate-500'>
                                        <span>Total: <strong className='text-slate-700'>{playerScore}</strong></span>
                                        {answerResult.currentStreak > 0 && (
                                            <span className='flex items-center gap-0.5 text-orange-600'>
                                                <FireIcon size={12} weight="fill" />
                                                {answerResult.currentStreak}x streak
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='text-3xl sm:text-4xl font-bold text-[#FF9700] shrink-0'>
                                +{answerResult.pointsEarned}
                            </div>
                        </div>
                    )}

                    {!answerResult && hasAnswered && (
                        <div className='flex items-center gap-2 px-6 py-4 border-b-2 border-slate-200 bg-slate-50'>
                            <ClockIcon size={20} weight="bold" className='text-slate-500' />
                            <p className='text-base font-oldschool text-slate-500'>Answer recorded! Calculating results...</p>
                        </div>
                    )}

                    {!hasAnswered && (
                        <div className='px-6 py-4 border-b-2 border-slate-200 bg-slate-50'>
                            <p className='text-base font-oldschool text-slate-500 text-center'>Time's up!</p>
                        </div>
                    )}

                    <div>
                        {leaderboard.length === 0 ? (
                            <p className='text-center text-slate-500 py-6'>Loading scores...</p>
                        ) : (
                            leaderboard.map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 last:border-b-0 ${
                                        player.playerName === playerName ? 'bg-[#FF9700]/5' : ''
                                    }`}
                                >
                                    <span className='w-6 text-xs font-bold text-slate-400 text-center shrink-0'>
                                        {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `#${index + 1}`}
                                    </span>
                                    <span className='text-sm sm:text-base font-oldschool truncate text-slate-800 flex-1'>
                                        {player.playerName}
                                        {player.playerName === playerName && (
                                            <span className='text-xs text-[#FF9700] ml-1.5 font-bold'>(You)</span>
                                        )}
                                    </span>
                                    <span className='text-sm sm:text-base font-bold text-slate-700 shrink-0'>
                                        {player.totalScore}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
    if (question && gameState === GameState.IN_PROGRESS) {
        return (
            <div className='game-pin-background flex flex-col justify-between h-screen bg-no-repeat bg-cover p-4'>
                <div className='flex items-center justify-between gap-2 max-w-4xl mx-auto w-full'>
                    <div className='text-white font-oldschool text-lg min-w-0 truncate'>
                        Q {currentQuestionNumber}/{totalQuestions}
                    </div>
                    <div className='bg-black/50 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shrink-0'>
                        <ClockIcon size={20} weight="fill" />
                        {timeLeft}s
                    </div>
                    <div className='text-white font-oldschool text-lg shrink-0'>
                        Score: {playerScore}
                    </div>
                </div>

                <Card className='w-full bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px] max-w-4xl mx-auto'>
                    <CardHeader className='text-center text-2xl font-bold text-slate-800'>
                        {question.question}
                    </CardHeader>
                </Card>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full'>
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
                                    min-h-[100px] sm:min-h-[120px] text-white text-lg sm:text-xl font-bold transition-all text-left
                                `}
                                variant="active"
                                size="xl"
                            >
                                {answer.answer}
                            </Button>
                        )
                    })}
                </div>

                <div className='text-center max-w-4xl mx-auto w-full'>
                    {hasAnswered ? (
                        <Card className='bg-white/95 border-2 border-slate-800 border-b-[4px] border-r-[4px]'>
                            <CardHeader>
                                <p className='text-lg font-oldschool text-slate-700 flex items-center justify-center gap-2'>
                                    <CheckCircleIcon size={20} weight="fill" className='text-green-500' />
                                    Answer submitted! Waiting for results...
                                </p>
                            </CardHeader>
                        </Card>
                    ) : (
                        <p className='text-white text-lg font-oldschool'>
                            Select your answer!
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
            <Card className='bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px]'>
                <CardHeader className='text-2xl animate-fadeIn'>
                    <div className='flex items-center gap-3 justify-center'>
                        <ClockIcon size={24} weight="bold" className='text-slate-600' />
                        Connecting...
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
}

export default PlayGame
