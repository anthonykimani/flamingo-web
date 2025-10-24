'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import { IAnswer, IQuestion } from '@/interfaces/IQuiz'
import { getGameSession } from '@/services/quiz_service'
import socketClient from '@/utils/socket.client'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

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
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('sessionId')
    const playerName = searchParams.get('playerName')

    useEffect(() => {
        if (!sessionId || !playerName) {
            console.error('Missing sessionId or playerName')
            return
        }

        const socket = socketClient.connect()

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
            setGameState(GameState.RESULTS_READY)
        })

        // Listen for game ended
        socketClient.onGameEnded((data: { leaderboard: any[] }) => {
            console.log('🏁 Game ended:', data)
            router.push(`/scoreboard?sessionId=${sessionId}`)
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
            <div className='result-background flex flex-col justify-center items-center h-screen bg-no-repeat bg-cover p-4'>
                <Card className='w-full max-w-md'>
                    <CardHeader className='text-center'>
                        <h2 className='text-3xl font-bold mb-4'>
                            {answerResult?.isCorrect ? '✅ Correct!' : '❌ Wrong!'}
                        </h2>
                        {answerResult && (
                            <div className='space-y-3'>
                                <div className='text-5xl font-bold text-blue-600'>
                                    +{answerResult.pointsEarned}
                                </div>
                                <div className='text-xl'>
                                    Total Score: <strong>{playerScore}</strong>
                                </div>
                                {answerResult.currentStreak > 0 && (
                                    <div className='text-lg text-orange-600'>
                                        🔥 Streak: {answerResult.currentStreak}
                                    </div>
                                )}
                            </div>
                        )}
                        {!answerResult && hasAnswered && (
                            <div className='text-xl'>
                                Answer recorded! Waiting for results...
                            </div>
                        )}
                        {!hasAnswered && (
                            <div className='text-xl text-gray-600'>
                                Time's up! No answer submitted.
                            </div>
                        )}
                    </CardHeader>
                </Card>
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
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {question.answers?.map((answer, index) => {
                        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500']
                        const isSelected = selectedAnswer === answer.id
                        
                        return (
                            <Button
                                key={answer.id}
                                onClick={() => handleAnswerSelect(answer)}
                                disabled={hasAnswered}
                                className={`
                                    ${colors[index % colors.length]} 
                                    ${isSelected ? 'ring-4 ring-white' : ''}
                                    ${hasAnswered ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                    h-24 text-xl font-bold text-white transition-all
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
                                <p className='text-lg font-semibold'>
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