import React, { useState } from 'react'
import { Card, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { JoystickIcon, MagicWandIcon, XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { addAgentQuiz, createGameSession } from '@/services/quiz_service'

const GenerateQuiz = () => {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        } catch (error) {
            console.error('Failed to create quiz/session:', error)
            alert('Failed to create game. Please try again.')
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-center items-center'>
            <Input
                className=''
                variant="title"
                leftIcon={<MagicWandIcon size={32} />}
                placeholder='Generate Game with AI'
                value={prompt}
                onChange={handlePromptChange}
            />
            <div className='flex flex-col md:flex-row justify-end mt-4 gap-2'>
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
    )
}

export default GenerateQuiz