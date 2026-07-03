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
        <div className="flex flex-col items-center min-h-[50vh] relative px-2">
            <div className="flex-1 flex flex-col justify-center items-center gap-6 w-full">
                <h1 className="font-[Oi] text-white [-webkit-text-stroke:1.5px_black] sm:[-webkit-text-stroke:2px_black] text-3xl xsm:text-5xl sm:text-6xl text-center">
                    Create New Game
                </h1>
                <div className="flex flex-col sm:flex-row justify-center w-full max-w-4xl gap-3 px-2">

                    <Card className='flex flex-row flex-1 cursor-pointer hover:scale-[1.02] transition-transform' onClick={() => router.push(`/themes?gameMode=${gameMode}`)}>
                        <CardHeader className='shrink-0'>
                            <CompassIcon size={32} />
                        </CardHeader>
                        <CardContent className='flex flex-col justify-center p-4 pl-0'>
                            <CardTitle className='text-base sm:text-lg'>
                                Select Theme
                            </CardTitle>
                            <CardDescription className='text-xs sm:text-sm'>
                                Choose a curated quiz by topic
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className='flex flex-row flex-1 cursor-pointer hover:scale-[1.02] transition-transform' onClick={onSelect}>
                        <CardHeader className='shrink-0'>
                            <FilePlusIcon size={32} />
                        </CardHeader>
                        <CardContent className='flex flex-col justify-center p-4 pl-0'>
                            <CardTitle className='text-base sm:text-lg'>
                                Blank Canvas
                            </CardTitle>
                            <CardDescription className='text-xs sm:text-sm'>
                                Create game from scratch
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className='flex flex-row flex-1 cursor-pointer hover:scale-[1.02] transition-transform' onClick={handleGenerate}>
                        <CardHeader className='shrink-0'>
                            <RobotIcon size={32} />
                        </CardHeader>
                        <CardContent className='flex flex-col justify-center p-4 pl-0'>
                            <CardTitle className='text-base sm:text-lg'>
                                Generate Game
                            </CardTitle>
                            <CardDescription className='text-xs sm:text-sm'>
                                Create an AI-assisted game
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ChooseCanvasType
