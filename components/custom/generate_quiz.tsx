'use client'

import React, { useState } from 'react'
import { Card, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { JoystickIcon, UserIcon, XIcon, CoinsIcon } from '@phosphor-icons/react'
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
            alert('Failed to create game. Please try again.')
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex flex-col justify-center p-2'>
            <div className='flex flex-row justify-between sm:items-center'>
                <NavigationBar />
                {/* <div className='flex flex-col items-center gap-2 animate-fadeIn'>
                    <Card className={`active:border-b-6 active:border-r-6 active:border-t-2 active:border-l-2  text-white p-6`}>
                        <CardHeader className='justify-center items-center'>
                            <UserIcon size={32} weight='fill' />
                        </CardHeader>
                    </Card>
                    <p className='text-lg text-white text-center font-bold truncate w-full'>
                        {isConnected }
                    </p>
                </div> */}
            </div>
            <div className='flex flex-col justify-around items-center p-2 h-full gap-4'>
                <h1 className="hidden sm:flex font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
                    Flamingo
                </h1>

                <div className='w-full sm:w-2/3 flex flex-col gap-4'>
                    <Input
                        className='w-full'
                        variant="generate"
                        placeholder='Generate Game with AI (e.g., "Create a 10-question quiz about World History")'
                        value={prompt}
                        onChange={handlePromptChange}
                    />

                    {/* Game Mode Display */}
                    <Card className='bg-white/90 p-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <Label className='text-lg font-semibold'>Game Mode</Label>
                                <p className='text-sm text-gray-600'>
                                    {gameMode === GameMode.HANGOUTS && 'Hangouts - Casual play with flexible settings'}
                                    {gameMode === GameMode.TEAM_BUILDING && 'Team Building - Collaborative gameplay'}
                                    {gameMode === GameMode.DEGEN_PVP && 'Degen PvP - Competitive with prizes'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Prize Configuration - Only for Hangouts mode */}
                    {gameMode === GameMode.HANGOUTS && (
                        <Card className='bg-white/90 p-4'>
                            <div className='flex flex-col gap-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <CoinsIcon size={24} />
                                        <Label htmlFor='prizes-toggle' className='text-lg font-semibold cursor-pointer'>
                                            Enable Prizes/Payouts
                                        </Label>
                                    </div>
                                    <Switch
                                        id='prizes-toggle'
                                        checked={hasPrizes}
                                        onCheckedChange={setHasPrizes}
                                    />
                                </div>

                                {hasPrizes && (
                                    <div className='flex flex-col gap-2 animate-fadeIn'>
                                        <Label htmlFor='prize-pool' className='text-sm'>
                                            Prize Pool Amount (ETH)
                                        </Label>
                                        <Input
                                            id='prize-pool'
                                            type='number'
                                            step='0.01'
                                            min='0'
                                            placeholder='0.1'
                                            value={prizePool}
                                            onChange={(e) => setPrizePool(e.target.value)}
                                            className='w-full'
                                        />
                                        <p className='text-xs text-gray-600'>
                                            ⚠️ Enabling prizes requires a minimum of 3 players to start the game.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Other game modes show prize info */}
                    {gameMode !== GameMode.HANGOUTS && (
                        <Card className='bg-blue-50 p-4 border-blue-200'>
                            <div className='flex items-center gap-2'>
                                <CoinsIcon size={24} className='text-blue-600' />
                                <p className='text-sm text-blue-800'>
                                    {gameMode === GameMode.DEGEN_PVP
                                        ? 'This mode includes prizes by default. Min 3 players required.'
                                        : 'This mode will include prizes in future updates.'
                                    }
                                </p>
                            </div>
                        </Card>
                    )}
                </div>

                <div className='flex flex-col xsm:flex-row justify-end mt-4 gap-2'>
                    <Button
                        leftIcon={<XIcon size={24} color='white' />}
                        variant="destructive"
                        size="xl"
                        onClick={() => router.push('/')}
                    >
                        Cancel
                    </Button>
                    <Button
                        leftIcon={<JoystickIcon size={28} />}
                        variant="active"
                        size="xl"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !prompt.trim()}
                    >
                        {isSubmitting ? 'Generating Quiz...' : 'Save & Continue'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GenerateQuiz