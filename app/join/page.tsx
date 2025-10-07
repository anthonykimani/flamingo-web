'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { JoinGameStep } from '@/enums/join_game_step'
import { LegoIcon, SparkleIcon, UserIcon } from '@phosphor-icons/react'
import React, { useState } from 'react'

const JoinGame = () => {
    const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.CHOOSEGAMEMODE);

    const handleNextStep = () => {
        switch (stepper) {
            case JoinGameStep.CHOOSEGAMEMODE:
                setStepper(JoinGameStep.ENTERGAMEPIN)
                break
            case JoinGameStep.ENTERGAMEPIN:
                setStepper(JoinGameStep.ENTERNICKNAME)
                break
            case JoinGameStep.ENTERNICKNAME:
                setStepper(JoinGameStep.LOBBYROOM)
                break
            case JoinGameStep.LOBBYROOM:
                break
        }
    }

    const renderStep = () => {
        switch (stepper) {
            case JoinGameStep.CHOOSEGAMEMODE:
                return (
                    <div className='flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Button
                                leftIcon={<LegoIcon size={24} weight="duotone" />}
                                variant="active"
                                size="xl"
                                onClick={() => handleNextStep()}
                            >
                                Enter Game Pin
                            </Button>
                            <Button
                                leftIcon={<SparkleIcon size={28} color='black' />}
                                variant="active"
                                size="xl"
                                onClick={() => handleNextStep()}
                            >
                                Create New Game
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.ENTERGAMEPIN:
                return (
                    <div className='flex flex-col game-pin-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Input
                                className=''
                                variant="default"
                                placeholder='Enter Game Pin'

                            />
                            <Button
                                variant="active"
                                size="xl"
                                buttoncolor={"darkened"}
                                onClick={() => handleNextStep()}
                            >
                                Start Game
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.ENTERNICKNAME:
                return (
                    <div className='flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Input
                                className=''
                                variant="default"
                                placeholder='Choose Nickname'

                            />
                            <Button
                                leftIcon={<SparkleIcon size={28} color='black' />}
                                variant="active"
                                size="xl"
                                onClick={() => handleNextStep()}
                            >
                                Ok, LFG!
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.LOBBYROOM:
                return (
                    <div className="flex flex-col p-2 gap-2 game-type-background h-screen bg-no-repeat bg-cover justify-center items-center">
                        <div className='flex flex-col '>
                            <Card className='active:border-b-6 active:border-r-6'>
                                <CardHeader className='justify-center items-center px-10'>
                                    <UserIcon size={32} />
                                </CardHeader>
                            </Card>
                            <h3 className='text-white text-xl text-center'> Jyuko </h3>
                        </div>
                        <Card className='active:border-b-6 active:border-r-6 w-1/5'>
                            <CardHeader className='justify-center items-center'>
                                You're in! See your nickname on Screen?
                            </CardHeader>
                        </Card>
                    </div>
                )
        }
    }

    return (
        renderStep()
    )
}

export default JoinGame