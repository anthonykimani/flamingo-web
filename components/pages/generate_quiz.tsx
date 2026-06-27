'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { JoystickIcon, XIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '../ui/input'
import { addAgentQuiz, createGameSession } from '@/services/quiz_service'
import NavigationBar from '../navigation/navigation-bar'
import { GameMode } from '@/enums/game_mode'

const GenerateQuiz = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameMode = (searchParams.get('gameMode') as GameMode) || GameMode.HANGOUTS;

    const [prompt, setPrompt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    }

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            alert('Please enter a prompt for quiz generation');
            return;
        }

        try {
            setIsSubmitting(true)

            const quizResponse = await addAgentQuiz(prompt);
            console.log('Quiz created:', quizResponse.payload)

            const gameConfig = {
                quizId: quizResponse.payload.id,
                gameMode,
                hasPrizes: false,
            };

            const sessionResponse = await createGameSession(gameConfig);
            console.log('Game session created:', sessionResponse.payload)

            router.push(`/lobby?sessionId=${sessionResponse.payload.id}&gamePin=${sessionResponse.payload.gamePin}&host=true`)
        } catch (error) {
            console.error('Failed to create quiz/session:', error)
            alert(error)
        } finally {
            setIsSubmitting(false);
        }

    }

    const gameModeLabels: Record<string, { title: string; description: string }> = {
        [GameMode.HANGOUTS]: { title: 'Hangouts', description: 'Casual play with friends.' },
        [GameMode.TEAM_BUILDING]: { title: 'Team Building', description: 'Collaborative gameplay for team bonding.' },
    }
    const gameModeDetails = gameModeLabels[gameMode] ?? { title: 'Unknown', description: '' }

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
                    <p className='text-white text-center text-lg font-semibold drop-shadow-lg'>
                        Mode: {gameModeDetails.title} — {gameModeDetails.description}
                    </p>

                    <Input
                        className='w-full'
                        variant="generate"
                        placeholder='Describe your quiz (e.g., "10 questions about Space Exploration" or "Fun trivia about 90s Pop Culture")'
                        value={prompt}
                        onChange={handlePromptChange}
                    />
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
