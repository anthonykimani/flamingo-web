'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { GamePill } from '@/components/ui/game-pill'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import { IAnswer, IPlayer, IQuestion } from '@/interfaces/IQuiz'
import { getGameSession } from '@/services/quiz_service'
import socketClient from '@/utils/socket/socket.client'
import { CheckCircleIcon, XCircleIcon, FireIcon, ClockIcon, HourglassIcon, TrophyIcon, UserIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import NavigationBar from '@/components/navigation/navigation-bar'
import { ANSWER_CONFIG } from '@/components/ui/answer-config'
import { GameTimer } from '@/components/ui/game-timer'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    const [preGameCountdown, setPreGameCountdown] = useState<number | null>(null)
    const [gameStarted, setGameStarted] = useState(false)
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

            // Socket already connected (singleton) — the 'connect' event
            // already fired, so join the room explicitly
            rejoinGame()
        }

        socket.on('connect', () => {
            console.log('✅ Player WebSocket reconnected — rejoining game room')
            rejoinGame()
        })

        socketClient.onGameStarted(() => {
            console.log('🚀 Game started')
            setGameStarted(true)
        })

        socket.on('pre-game-countdown', (data: { count: number }) => {
            console.log('⏳ Pre-game countdown:', data.count)
            setPreGameCountdown(data.count)
        })

        socket.on('countdown-tick', (data: { count: number }) => {
            console.log('⏰ Countdown:', data.count)
            setCountdown(data.count)
            setGameState(GameState.COUNTDOWN)
            setPreGameCountdown(null)
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
            setPreGameCountdown(null)
            setGameStarted(false)
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
            if (!sessionId) return
            router.push(`/score?sessionId=${sessionId}`)
        })

        socketClient.onError((data: { message: string }) => {
            console.error('⚠️ Socket error:', data.message)
            toast.error(data.message)
        })

        return () => {
            socket.off('countdown-tick')
            socket.off('time-update')
            socket.off('pre-game-countdown')
            socket.off(SocketEvents.GAME_STARTED)
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

        if (!answer.id || !question.id) {
            console.error('Missing answer or question ID')
            return
        }

        setSelectedAnswer(answer.id)

        const timeToAnswer = (new Date().getTime() - questionStartTime.getTime()) / 1000

        socketClient.submitAnswer({
            gameSessionId: sessionId,
            playerName: playerName,
            questionId: question.id,
            answerId: answer.id,
            timeToAnswer: Math.round(timeToAnswer)
        })
    }

    if (countdown !== null && gameState === GameState.COUNTDOWN) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <div className='absolute top-4 left-4 z-50'>
                    <NavigationBar route="/" />
                </div>
                <div className='text-center animate-fadeIn'>
                    <div className='text-white text-9xl font-bold'>
                        {countdown}
                    </div>
                    <p className='text-white text-2xl font-oldschool mt-4'>Get Ready!</p>
                </div>
            </div>
        )
    }

    if (preGameCountdown !== null) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <div className='absolute top-4 left-4 z-50'>
                    <NavigationBar route="/" />
                </div>
                <div className='text-center animate-fadeIn'>
                    <div className='text-white text-9xl font-bold'>
                        {preGameCountdown}
                    </div>
                    <p className='text-white text-2xl font-oldschool mt-4'>
                        Game starting in {preGameCountdown}s...
                    </p>
                </div>
            </div>
        )
    }

    if (gameState === GameState.WAITING) {
        return (
            <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <div className='absolute top-4 left-4 z-50'>
                    <NavigationBar route="/" />
                </div>
                <div className='w-full max-w-md mx-4 bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] py-10 px-8 text-center animate-fadeIn'>
                    <div className='flex justify-center mb-5'>
                        <HourglassIcon size={48} className='text-slate-600 animate-icon-spin' />
                    </div>
                    <p className='text-2xl font-oldschool mb-3 text-slate-800'>
                        {gameStarted ? 'Game is starting...' : 'Getting game ready...'}
                    </p>
                    <p className='text-base text-slate-500'>
                        {gameStarted ? 'Get ready!' : 'Waiting for host to start the game'}
                    </p>
                    <div className='mt-6 text-sm text-slate-400'>
                        Player: <strong className='text-slate-700'>{playerName}</strong>
                    </div>
                </div>
            </div>
        )
    }

    if (gameState === GameState.RESULTS_READY) {
    return (
        <div className='game-pin-background flex justify-center items-center h-screen bg-no-repeat bg-cover p-4'>
            <div className='absolute top-4 left-4 z-50'>
                <NavigationBar route="/" />
            </div>
            <div className='w-full max-w-2xl'>
                <div className='bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] overflow-hidden'>
                    {answerResult && (
                        <div className={`px-4 sm:px-6 py-5 flex items-center justify-between gap-3 ${answerResult.isCorrect ? 'bg-[#009900]' : 'bg-[#DA0202]'} animate-fadeIn`}>
                            <div className='flex items-center gap-3'>
                                {answerResult.isCorrect ? (
                                    <CheckCircleIcon size={32} weight="fill" className='text-white shrink-0' />
                                ) : (
                                    <XCircleIcon size={32} weight="fill" className='text-white shrink-0' />
                                )}
                                <div>
                                    <p className='text-2xl sm:text-3xl font-bold text-white leading-none'>
                                        {answerResult.isCorrect ? 'Correct!' : 'Wrong!'}
                                    </p>
                                    <div className='flex items-center gap-3 mt-1.5 text-sm font-oldschool text-white/90'>
                                        <span>Total: <strong className='text-white'>{playerScore}</strong></span>
                                        {answerResult.currentStreak > 0 && (
                                            <span className='flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-white'>
                                                <FireIcon size={14} weight="fill" />
                                                {answerResult.currentStreak}x streak
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='bg-white rounded-xl border-2 border-slate-800 border-b-[4px] border-r-[4px] px-4 py-2 text-2xl sm:text-3xl font-bold text-[#FF9700] shrink-0'>
                                +{answerResult.pointsEarned}
                            </div>
                        </div>
                    )}

                    {!answerResult && hasAnswered && (
                        <div className='flex items-center gap-2 px-6 py-4 border-b-2 border-slate-200 bg-[#FF9700]/10'>
                            <ClockIcon size={20} weight="bold" className='text-[#FF9700]' />
                            <p className='text-base font-oldschool text-[#cc7800] font-bold'>Answer locked! Crunching results...</p>
                        </div>
                    )}

                    {!hasAnswered && (
                        <div className='px-6 py-5 border-b-2 border-slate-200 bg-[#F14100]/5'>
                            <p className='text-lg font-oldschool text-[#F14100] text-center font-bold flex items-center justify-center gap-2'>
                                <ClockIcon size={20} weight="bold" />
                                Time's up!
                            </p>
                        </div>
                    )}

                    {question && (
                        <div className='px-4 sm:px-6 py-5 border-b-2 border-slate-200'>
                            <div className='flex items-center gap-2 mb-3'>
                                <GamePill variant="meta">ANSWER</GamePill>
                            </div>
                            <div className='space-y-2'>
                                {question.answers.map((answer, index) => {
                                    const { Icon } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
                                    const isSelected = selectedAnswer === answer.id
                                    const isCorrectAnswer = answer.correctAnswer
                                    const isWrongPick = isSelected && !isCorrectAnswer
                                    return (
                                        <div
                                            key={answer.id}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-oldschool text-sm ${
                                                isCorrectAnswer
                                                    ? 'bg-[#009900] border-2 border-[#006600] border-b-[4px] border-r-[4px] text-white font-bold'
                                                    : isWrongPick
                                                        ? 'bg-[#DA0202] border-2 border-[#8a0101] border-b-[4px] border-r-[4px] text-white font-bold'
                                                        : 'bg-slate-50 border border-slate-200 text-slate-400'
                                            }`}
                                        >
                                            {isCorrectAnswer ? (
                                                <CheckCircleIcon size={20} weight="fill" className='shrink-0' />
                                            ) : isWrongPick ? (
                                                <XCircleIcon size={20} weight="fill" className='shrink-0' />
                                            ) : (
                                                <span className='w-6 h-6 rounded-md bg-black/10 flex items-center justify-center shrink-0'>
                                                    <Icon size={16} color="#64748b" />
                                                </span>
                                            )}
                                            <span>{answer.answer}</span>
                                            {isCorrectAnswer && (
                                                <span className='ml-auto text-xs font-bold uppercase tracking-wider text-white/80'>Correct</span>
                                            )}
                                            {isWrongPick && (
                                                <span className='ml-auto text-xs font-bold uppercase tracking-wider text-white/80'>Your pick</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className='px-4 sm:px-6 py-5'>
                        <div className='flex items-center gap-2 mb-4'>
                            <GamePill variant="meta">SCOREBOARD</GamePill>
                        </div>
                        <div className='space-y-2 max-h-[40vh] overflow-y-auto pr-1'>
                            {leaderboard.length === 0 ? (
                                <p className='text-center text-slate-400 py-8 font-oldschool'>
                                    Tallying up...
                                </p>
                            ) : (
                                leaderboard.map((player, index) => {
                                    const isYou = player.playerName === playerName
                                    return (
                                        <div
                                            key={player.id}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-b-[4px] border-r-[4px] animate-fadeIn ${
                                                isYou
                                                    ? 'bg-[#FF9700] border-[#cc7800]'
                                                    : 'bg-white border-slate-800'
                                            }`}
                                            style={{ animationDelay: `${index * 60}ms` }}
                                        >
                                            <div className='w-8 h-8 flex items-center justify-center shrink-0'>
                                                {index === 0 ? (
                                                    <TrophyIcon size={22} className={isYou ? 'text-white' : 'text-[#FF9700]'} weight="fill" />
                                                ) : index === 1 ? (
                                                    <TrophyIcon size={20} className={isYou ? 'text-white' : 'text-[#1E293B]'} weight="fill" />
                                                ) : index === 2 ? (
                                                    <TrophyIcon size={18} className={isYou ? 'text-white' : 'text-[#F14100]'} weight="fill" />
                                                ) : (
                                                    <span className={`text-xs font-bold ${isYou ? 'text-white' : 'text-slate-400'}`}>{index + 1}</span>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-2 flex-1 min-w-0'>
                                                <UserIcon size={16} className={isYou ? 'text-white' : 'text-slate-400'} shrink-0 />
                                                <span className={`text-sm sm:text-base font-oldschool truncate ${isYou ? 'text-white' : 'text-slate-800'}`}>
                                                    {player.playerName}
                                                    {isYou && (
                                                        <span className='text-xs bg-white/25 px-1.5 py-0.5 rounded-full ml-1.5 font-bold'>
                                                            (You)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full font-bold text-sm shrink-0 ${isYou ? 'bg-white text-[#cc7800]' : 'bg-black/10 text-slate-700'}`}>
                                                {player.totalScore}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
    if (question && gameState === GameState.IN_PROGRESS) {
        return (
            <div className='game-pin-background flex flex-col justify-between h-screen bg-no-repeat bg-cover p-4'>
                <div className='absolute top-4 left-4 z-50'>
                    <NavigationBar route="/" />
                </div>
                <div className='flex items-center justify-between gap-2 max-w-4xl mx-auto w-full'>
                    <div className='text-white font-oldschool text-lg min-w-0 truncate'>
                        Q {currentQuestionNumber}/{totalQuestions}
                    </div>
                    <GameTimer seconds={timeLeft} />
                    <div className='text-white font-oldschool text-lg shrink-0'>
                        Score: {playerScore}
                    </div>
                </div>

                <Card className='w-full bg-white/95 border-2 border-slate-800 border-b-[6px] border-r-[6px] max-w-4xl mx-auto'>
                    <CardHeader className='text-center text-2xl font-oldschool text-slate-800'>
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
                                leftIcon={<Icon size={32} color="white" />}
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
                                    <CheckCircleIcon size={20} className='text-[#009900]' />
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
            <div className='absolute top-4 left-4 z-50'>
                <NavigationBar route="/" />
            </div>
            <div className='bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] py-10 px-8 text-center animate-fadeIn'>
                <div className='flex items-center gap-3 justify-center'>
                    <ClockIcon size={24} weight="bold" className='text-slate-600' />
                    <span className='text-2xl font-oldschool text-slate-600'>Knocking...</span>
                </div>
            </div>
        </div>
    )
}

export default PlayGame
