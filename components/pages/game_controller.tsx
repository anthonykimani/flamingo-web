'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SquareIcon, StarIcon, CircleIcon, TriangleIcon, UsersThreeIcon, CheckCircleIcon, TrophyIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSession, getGameSessionByGamePin, getQuizById, getActivePlayers } from '@/services/quiz_service'
import { IPlayer, IQuiz } from '@/interfaces/IQuiz'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import socketClient from '@/utils/socket/socket.client'

const ANSWER_CONFIG = [
    { Icon: SquareIcon, color: 'bg-[#009900]', borderColor: 'border-[#006600]' },
    { Icon: StarIcon, color: 'bg-[#FF9700]', borderColor: 'border-[#cc7800]' },
    { Icon: TriangleIcon, color: 'bg-[#2819DB]', borderColor: 'border-[#1a0f8a]' },
    { Icon: CircleIcon, color: 'bg-[#F14100]', borderColor: 'border-[#b33000]' }
]

function AutoAdvance({ onAdvance }: { onAdvance: () => void }) {
    const [count, setCount] = useState(5)

    useEffect(() => {
        if (count <= 0) {
            onAdvance()
            return
        }
        const timer = setTimeout(() => setCount(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [count, onAdvance])

    return (
        <div className='fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fadeIn'>
            <div className='bg-white/90 rounded-xl border-2 border-slate-800 border-b-[4px] border-r-[4px] px-5 py-2 flex items-center gap-3'>
                <div className='text-lg font-bold text-slate-800'>{count}</div>
                <p className='text-sm font-oldschool text-slate-500'>
                    Next question in {count}s
                </p>
            </div>
        </div>
    )
}

const GamePage = () => {
    const [quizData, setQuizData] = useState<IQuiz | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answersReceived, setAnswersReceived] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(10)
    const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])
    const [playersAnswered, setPlayersAnswered] = useState<Set<string>>(new Set())
    const [playerCount, setPlayerCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
    const [countdown, setCountdown] = useState<number | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const gamePinId = searchParams.get("gamePin")
    const sessionId = searchParams.get("sessionId")

    const rejoinGame = () => {
        if (sessionId) {
            console.log('🔁 Host re-joining game room after reconnect')
            socketClient.joinGame(sessionId, 'Host', '')
        }
    }

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

    useEffect(() => {
        if (countdown === null || countdown <= 0) return

        const countdownTimer = setTimeout(() => {
            setCountdown(prev => prev! - 1)
        }, 1000)

        return () => clearTimeout(countdownTimer)
    }, [countdown])

    useEffect(() => {
        if (!sessionId) return

        const socket = socketClient.connect()

        if (socket.connected && sessionId) {
            getGameSession(sessionId).then(response => {
                setGameState(response.payload.status as GameState)
                setCurrentQuestionIndex(response.payload.currentQuestionIndex)
                setTimeLeft(response.payload.timeLeft)
            }).catch(console.error)
            getActivePlayers(sessionId)
                .then(d => {
                    if (d?.payload?.length) setPlayerCount(d.payload.length)
                }).catch(() => {})
        }

        if (socket.connected) {
            console.log('✅ Already connected to WebSocket')
            setIsConnected(true)
        }

        socket.on('connect', () => {
            console.log('✅ Host connected to WebSocket')
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('❌ Host disconnected from WebSocket')
            setIsConnected(false)
        })

        socket.on('connect', () => {
            console.log('✅ Host WebSocket reconnected — rejoining room')
            setIsConnected(true)
            rejoinGame()
        })

        socket.on('countdown-tick', (data) => {
            console.log('⏳ Countdown tick:', data.countdown)
            setCountdown(data.countdown)
            setGameState(GameState.COUNTDOWN)
        })

        socket.on('time-update', (data) => {
            setTimeLeft(data.timeLeft)
        })

        socket.on('game-state-changed', (data: { state: GameState }) => {
            console.log('🔄 Game state changed:', data.state)
            setGameState(data.state)
        })

        socketClient.onPlayerAnswered((data) => {
            console.log('✅ Player answered:', data.playerName)
            setPlayersAnswered(prev => new Set([...prev, data.playerName]))
            setAnswersReceived(data.answerCount)
        })

        socketClient.onQuestionResults((data) => {
            console.log('📊 Question results:', data)
            setLeaderboard(data.leaderboard)
            setGameState(GameState.RESULTS_READY)
        })

        socketClient.onPlayerJoined((data) => {
            console.log('👥 Player joined during game:', data.playerName)
            if (data.totalPlayers) {
                setPlayerCount(data.totalPlayers)
            }
        })

        socketClient.onGameEnded((data) => {
            console.log('🏁 Game ended:', data)
            router.push(`/score?sessionId=${sessionId}`)
        })

        socket.on('question-started', (data) => {
            console.log('⏱️ Question timer started:', data)
            setGameState(GameState.IN_PROGRESS)
            setCountdown(null)
        })

        return () => {
            socketClient.off('player-answered')
            socketClient.off('question-results')
            socketClient.off(SocketEvents.GAME_ENDED)
            socket.off('question-started')
            socket.off('countdown-tick')
            socket.off('time-update')
            socket.off('game-state-changed')
        }
    }, [sessionId])

    useEffect(() => {
        setPlayersAnswered(new Set())
        setAnswersReceived(0)
    }, [currentQuestionIndex])

    const handleNextQuestion = async () => {
        if (!quizData || !sessionId) return

        if (currentQuestionIndex < quizData.questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1
            setCurrentQuestionIndex(nextIndex)
            setGameState(GameState.IN_PROGRESS)

            socketClient.nextQuestion(sessionId, nextIndex)
        } else {
            setGameState(GameState.COMPLETED)

            socketClient.endGame(sessionId)

            router.push(`/score?sessionId=${sessionId}`)
        }
    }

    if (loading) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card className='bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px]'>
                    <CardHeader className='text-2xl animate-fadeIn'>Loading quiz...</CardHeader>
                </Card>
            </div>
        )
    }

    if (error || !quizData) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card className='bg-white/95 border-2 border-red-400 border-b-[6px] border-r-[6px]'>
                    <CardHeader className='text-2xl text-red-500 animate-fadeIn'>
                        {error || 'Quiz not found'}
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card className='bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px]'>
                    <CardHeader className='text-2xl animate-fadeIn'>Connecting to game server...</CardHeader>
                </Card>
            </div>
        )
    }

    const currentQuestion = quizData.questions[currentQuestionIndex]

    if (countdown !== null && countdown > 0) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <div className='text-center animate-fadeIn'>
                    <div className='text-white text-9xl font-bold mb-4'>
                        {countdown}
                    </div>
                    <p className='text-white text-2xl font-oldschool'>Get Ready!</p>
                </div>
            </div>
        )
    }

    if (gameState === GameState.RESULTS_READY || gameState === GameState.PAYOUT) {
    return (
        <div className='result-background h-screen bg-no-repeat bg-cover flex flex-col justify-center items-center p-4'>
            <AutoAdvance onAdvance={handleNextQuestion} />
            <div className='w-full max-w-3xl space-y-6'>
                <Card className='bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px]'>
                    <CardHeader className='py-6'>
                        <h3 className='text-3xl font-bold text-center mb-6'>Scoreboard</h3>
                        <div className='space-y-3 max-h-[60vh] overflow-y-auto pr-2'>
                            {leaderboard.length === 0 ? (
                                <p className='text-center text-slate-500 py-8'>Loading scores...</p>
                            ) : (
                                leaderboard.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className='flex items-center gap-4 p-4 rounded-lg bg-slate-50 border-2 border-slate-800 border-b-[4px] border-r-[4px]'
                                    >
                                        <div className='text-2xl font-bold w-10 text-center shrink-0'>
                                            {index === 0 ? (
                                                <TrophyIcon size={28} weight="fill" className='text-yellow-500' />
                                            ) : index === 1 ? (
                                                <TrophyIcon size={24} weight="fill" className='text-slate-400' />
                                            ) : index === 2 ? (
                                                <TrophyIcon size={20} weight="fill" className='text-orange-500' />
                                            ) : (
                                                <span className='text-slate-500'>#{index + 1}</span>
                                            )}
                                        </div>
                                        <div className='flex items-center gap-3 flex-1'>
                                            <h3 className='text-xl font-oldschool truncate'>
                                                {player.playerName}
                                            </h3>
                                        </div>
                                        <div className='text-3xl font-bold text-slate-700'>
                                            {player.totalScore}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardHeader>
                </Card>

                <div className='flex justify-center'>
                    <Button
                        variant="active"
                        size="xl"
                        onClick={handleNextQuestion}
                        className='max-w-xs'
                    >
                        Next Question
                    </Button>
                </div>
            </div>
        </div>
    )
}

    return (
        <div className='game-pin-background h-full md:h-screen bg-no-repeat bg-cover flex justify-around'>
            <div className='w-full flex flex-col justify-center gap-10 px-4 max-w-5xl mx-auto'>
                <div className='absolute top-4 right-4 flex items-center gap-2'>
                    <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className='text-white text-sm font-oldschool'>
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>

                <Card className='bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px] max-w-4xl mx-auto w-full'>
                    <CardHeader className='text-3xl text-center font-bold'>
                        {currentQuestion.question}
                    </CardHeader>
                </Card>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full'>
                    {currentQuestion.answers.map((answer, index) => {
                        const { Icon, color, borderColor } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
                        return (
                            <Card
                                key={answer.id}
                                className={`${color} ${borderColor} border-2 border-b-[6px] border-r-[6px] cursor-default h-[150px] flex items-center justify-center relative`}
                            >
                                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                    <Icon size={48} color="white" weight="fill" />
                                </div>
                                <CardContent className="flex items-center justify-center w-full pl-20 pr-6">
                                    <p className="text-4xl font-bold text-white text-center line-clamp-3 overflow-hidden break-words">
                                        {answer.answer}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className='flex flex-wrap items-center justify-center sm:justify-between gap-4 max-w-4xl mx-auto w-full'>
                    <div className='flex items-center gap-3 order-1 sm:order-none'>
                        <div className='border-2 border-slate-800 p-4 font-bold text-white text-3xl rounded-full bg-[#F24E1E] min-w-[60px] text-center'>
                            {timeLeft}
                        </div>
                        <p className='text-white text-lg font-oldschool'>seconds remaining</p>
                    </div>
                    <div className='flex items-center gap-4 order-3 sm:order-none sm:ml-auto'>
                        <span className='bg-black/40 px-4 py-2 rounded-full text-white text-sm font-oldschool flex items-center gap-1.5'>
                            <UsersThreeIcon size={18} weight="fill" />
                            {playerCount > 0 ? `${playerCount} players` : 'Waiting for players'}
                        </span>
                        <Button variant="active" size="xl" className='!w-auto'>
                            Q {currentQuestionIndex + 1}/{quizData.questions.length}
                        </Button>
                    </div>
                </div>

                {playersAnswered.size > 0 && (
                    <div className='max-w-4xl mx-auto w-full'>
                        <Card className='bg-white/95 border-2 border-slate-800 border-b-[4px] border-r-[4px]'>
                            <CardHeader>
                                <p className='text-sm text-slate-500 font-oldschool flex items-center gap-1.5'>
                                    <CheckCircleIcon size={16} weight="fill" className='text-green-500' />
                                    Players who answered
                                </p>
                                <div className='flex flex-wrap gap-2 mt-1'>
                                    {Array.from(playersAnswered).map((playerName) => (
                                        <span
                                            key={playerName}
                                            className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-oldschool flex items-center gap-1'
                                        >
                                            <CheckCircleIcon size={14} weight="fill" />
                                            {playerName}
                                        </span>
                                    ))}
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GamePage
