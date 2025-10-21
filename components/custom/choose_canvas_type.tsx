'use client'

import React from 'react'
import { Button } from '../ui/button'
import { FilePlusIcon, RankingIcon, RobotIcon, StrategyIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useRouter } from 'next/navigation'

const ChooseCanvasType = ({ onSelect }: { onSelect: () => void }) => {
    const router = useRouter();

    const handleGenerate = () => {
        router.push("/generate");
    }

    return (
        <div className="flex flex-col h-1/2 justify-around items-center">
            <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-3xl sm:text-6xl text-center">
                Create New Game
            </h1>
            <div className="flex flex-col sm:flex-row justify-center w-full">
                <Card className='flex flex-row m-2 cursor-pointer' onClick={handleGenerate}>
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

                <Card className='flex flex-row m-2 cursor-pointer' onClick={onSelect}>
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

            </div>
            <Button variant={"active"} className='bg-black/10 text-white' size={"xl"} >Create your Quiz</Button>
        </div>
    )
}

export default ChooseCanvasType