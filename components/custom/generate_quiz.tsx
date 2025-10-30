'use client'

import React, { useState } from 'react'
import { Card, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { JoystickIcon, UserIcon, XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { addAgentQuiz, createGameSession } from '@/services/quiz_service'
import NavigationBar from '../navigation/navigation-bar'
import { useAppKitAccount } from '@reown/appkit/react'

const GenerateQuiz = () => {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false)
      const { isConnected, address } = useAppKitAccount()

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)

            // Create Quiz
            const quizResponse = await addAgentQuiz(prompt);
            console.log('Quiz created:', quizResponse.payload)

            // Create game session
            const sessionResponse = await createGameSession(quizResponse.payload.id)
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
            <div className='flex flex-col justify-around items-center p-2 h-full'>
                <h1 className="hidden sm:flex font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
                    Flamingo
                </h1>
                <Input
                    className='w-full sm:w-1/2'
                    variant="generate"
                    placeholder='Generate Game with AI'
                    value={prompt}
                    onChange={handlePromptChange}
                />
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Generating Quiz...' : 'Save & Continue'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GenerateQuiz