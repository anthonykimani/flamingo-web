'use client'

import React from 'react'
import { Button } from '../ui/button'
import { CompassIcon, FilePlusIcon, RobotIcon } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useRouter } from 'next/navigation'
import { GameMode } from '@/enums/game_mode'

const ChooseCanvasType = ({ gameMode, onSelect}:{ gameMode: GameMode, onSelect:()=> void}) => {
    const router = useRouter();

    const handleGenerate = () => {
        router.push(`/generate?gameMode=${gameMode}`);
    }

    return (
        <div className="flex flex-col h-1/2 justify-around items-center">
            <h1 className="font-[Oi] text-white [-webkit-text-stroke:1.5px_black] sm:[-webkit-text-stroke:2px_black] text-3xl xsm:text-5xl sm:text-6xl text-center">
                Create New Game
            </h1>
            <div className="flex flex-col sm:flex-row justify-center w-full">

                <Card className='flex flex-row flex-1 m-2 cursor-pointer' onClick={() => router.push(`/themes?gameMode=${gameMode}`)}>
                    <CardHeader>
                        <CompassIcon size={32} />
                    </CardHeader>
                    <CardContent className='flex flex-col'>
                        <CardTitle>
                            Select Theme
                        </CardTitle>
                        <CardDescription>
                            Choose a curated quiz by topic
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className='flex flex-row flex-1 m-2 cursor-pointer' onClick={onSelect}>
                    <CardHeader>
                        <FilePlusIcon size={32} />
                    </CardHeader>
                    <CardContent className='flex flex-col'>
                        <CardTitle>
                            Blank Canvas
                        </CardTitle>
                        <CardDescription>
                            Create game from scratch
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className='flex flex-row flex-1 m-2 opacity-60 cursor-not-allowed' showComingSoon>
                    <CardHeader>
                        <RobotIcon size={32} />
                    </CardHeader>
                    <CardContent className='flex flex-col'>
                        <CardTitle>
                            Generate Game
                        </CardTitle>
                        <CardDescription>
                            Create an AI-assisted game
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ChooseCanvasType
