'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { JoystickIcon, UserIcon, XIcon, CoinsIcon, SparkleIcon, LightningIcon, UsersIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '../ui/input'
import { addAgentQuiz, createGameSession } from '@/services/quiz_service'
import NavigationBar from '../navigation/navigation-bar'
import { useAppKitAccount } from '@reown/appkit/react'
import { GameMode } from '@/enums/game_mode'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

const GenerateQuiz = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameMode = (searchParams.get('gameMode') as GameMode) || GameMode.HANGOUTS;

    const [prompt, setPrompt] = useState("");
    const [hasPrizes, setHasPrizes] = useState(false);
    const [prizePool, setPrizePool] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isConnected, address } = useAppKitAccount();

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    }

    const handleSubmit = async () => {
        // Validation
        if (!prompt.trim()) {
            alert('Please enter a prompt for quiz generation');
            return;
        }

        if (hasPrizes && !prizePool.trim()) {
            alert('Please enter a prize pool amount');
            return;
        }

        if (hasPrizes && parseFloat(prizePool) <= 0) {
            alert('Prize pool must be greater than 0');
            return;
        }

        try {
            setIsSubmitting(true)

            // Create Quiz
            const quizResponse = await addAgentQuiz(prompt);
            console.log('Quiz created:', quizResponse.payload)

            // Create game session with config
            const gameConfig = {
                quizId: quizResponse.payload.id,
                gameMode,
                hasPrizes,
                ...(hasPrizes && {
                    prizePool: parseFloat(prizePool),
                    minPlayers: 3
                })
            };

            const sessionResponse = await createGameSession(gameConfig);
            console.log('Game session created:', sessionResponse.payload)

            // Navigate to lobby with game session
            router.push(`/lobby?sessionId=${sessionResponse.payload.id}&gamePin=${sessionResponse.payload.gamePin}&host=true`)
        } catch (error) {
            console.error('Failed to create quiz/session:', error)
            alert(error)
        } finally {
            setIsSubmitting(false);
        }

    }

    // Get game mode details
    const getGameModeDetails = () => {
        switch (gameMode) {
            case GameMode.HANGOUTS:
                return {
                    icon: <UsersIcon size={32} weight="duotone" className="text-slate-700" />,
                    title: 'Hangouts',
                    description: 'Casual play with friends. Optional prizes & flexible settings.'
                }
            case GameMode.TEAM_BUILDING:
                return {
                    icon: <UsersIcon size={32} weight="duotone" className="text-slate-700" />,
                    title: 'Team Building',
                    description: 'Collaborative gameplay perfect for team bonding.'
                }
            case GameMode.DEGEN_PVP:
                return {
                    icon: <LightningIcon size={32} weight="duotone" className="text-slate-700" />,
                    title: 'Degen PvP',
                    description: 'High-stakes competitive gameplay with crypto prizes.'
                }
            default:
                return {
                    icon: <UsersIcon size={32} weight="duotone" />,
                    title: 'Unknown',
                    description: ''
                }
        }
    }

    const gameModeDetails = getGameModeDetails();

    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex flex-col p-2 overflow-y-auto'>
            <div className='flex flex-row justify-between sm:items-center mb-4'>
                <NavigationBar />
            </div>

            <div className='flex flex-col justify-center items-center p-2 flex-1 gap-6 max-w-4xl mx-auto w-full'>
                {/* Header */}
                <div className='text-center space-y-2'>
                    <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-5xl sm:text-7xl">
                        Create Your Game
                    </h1>
                    <p className='text-white text-lg sm:text-xl font-semibold drop-shadow-lg'>
                        Let AI generate your perfect quiz
                    </p>
                </div>

                <div className='w-full flex flex-col gap-4'>
                    {/* Combined Game Mode & Prize Info Card */}
                    <Card className='bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all'>
                        <CardContent className='p-3 space-y-4'>
                            {/* Game Mode Section */}
                            <div className='flex items-start gap-4'>
                                <div className='p-3 bg-slate-100 rounded-xl border-2 border-slate-300'>
                                    {gameModeDetails.icon}
                                </div>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-1 flex-wrap'>
                                        <Label className='text-xl font-bold'>Game Mode</Label>
                                        <span className='px-3 py-1 rounded-full text-xs font-bold bg-slate-100 border-2 border-slate-300'>
                                            {gameModeDetails.title}
                                        </span>
                                    </div>
                                    <p className='text-sm text-slate-600 font-medium'>
                                        {gameModeDetails.description}
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className='border-t-2 border-slate-200' />

                            {/* Prize Info Section */}
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-slate-100 rounded-lg border-2 border-slate-300'>
                                    <CoinsIcon size={24} weight="duotone" className='text-slate-700' />
                                </div>
                                <div className='flex-1'>
                                    <p className='text-sm font-semibold text-slate-800'>
                                        {gameMode === GameMode.DEGEN_PVP
                                            ? '🔥 This mode includes prizes by default'
                                            : gameMode === GameMode.HANGOUTS
                                                ? '💰 Optional prize pool available below'
                                                : '🚧 Prize functionality coming soon for this mode'
                                        }
                                    </p>
                                    {gameMode === GameMode.DEGEN_PVP && (
                                        <p className='text-xs text-slate-600 mt-1'>
                                            Minimum 3 players required to start
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Prompt Input */}
                    <Input
                        className='w-full'
                        variant="generate"
                        placeholder='Describe your quiz (e.g., "10 questions about Space Exploration" or "Fun trivia about 90s Pop Culture")'
                        value={prompt}
                        onChange={handlePromptChange}
                    />


                    {/* Prize Configuration - Only for Hangouts */}
                    {gameMode === GameMode.HANGOUTS && (
                        <Card className='bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all'>
                            <CardContent className='p-6'>
                                <div className='flex flex-col gap-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='p-2 bg-yellow-100 rounded-lg'>
                                                <CoinsIcon size={28} weight="duotone" className='text-yellow-600' />
                                            </div>
                                            <div>
                                                <Label htmlFor='prizes-toggle' className='text-lg font-bold cursor-pointer block'>
                                                    Prize Pool
                                                </Label>
                                                <p className='text-xs text-slate-600'>
                                                    Add crypto rewards to make it interesting
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            id='prizes-toggle'
                                            checked={hasPrizes}
                                            onCheckedChange={setHasPrizes}
                                        />
                                    </div>

                                    {hasPrizes && (
                                        <div className='flex flex-col gap-3 pt-4 border-t-2 border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300'>
                                            <Label htmlFor='prize-pool' className='text-sm font-semibold text-slate-900'>
                                                Prize Pool Amount (ETH)
                                            </Label>
                                            <div className='relative'>
                                                <Input
                                                    id='prize-pool'
                                                    type='number'
                                                    step='0.01'
                                                    min='0'
                                                    placeholder='0.1'
                                                    value={prizePool}
                                                    onChange={(e) => setPrizePool(e.target.value)}
                                                    className='w-full pl-12 text-lg font-semibold'
                                                />
                                                <CoinsIcon
                                                    size={24}
                                                    className='absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600'
                                                    weight="duotone"
                                                />
                                            </div>
                                            <div className='bg-amber-50 border-2 border-amber-200 rounded-lg p-3'>
                                                <p className='text-xs text-amber-800 font-medium flex items-center gap-2'>
                                                    <span className='text-lg'>⚠️</span>
                                                    <span>Minimum 3 players required when prizes are enabled</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col xsm:flex-row justify-center items-center mt-6 gap-3 w-full sm:w-auto'>
                    <Button
                        leftIcon={<XIcon size={24} color='white' />}
                        variant="destructive"
                        size="xl"
                        onClick={() => router.push('/')}
                        className='w-full sm:w-auto'
                    >
                        Cancel
                    </Button>
                    <Button
                        leftIcon={isSubmitting ? null : <JoystickIcon size={28} />}
                        variant="active"
                        size="xl"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !prompt.trim()}
                        className='w-full sm:w-auto relative overflow-hidden'
                    >
                        {isSubmitting ? (
                            <span className='flex items-center gap-2'>
                                <span className='animate-spin'>⚡</span>
                                Generating Quiz...
                            </span>
                        ) : (
                            'Create Game'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GenerateQuiz