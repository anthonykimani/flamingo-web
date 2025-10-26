'use client'

import React from 'react'
import { Button } from '../ui/button'
import { GameControllerIcon, MagicWandIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation';

const StartScreen = () => {
    const router = useRouter();

    const createGame = () => {
        router.push("/create")
    }

    return (
        <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3">
            <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
                Flamingo
            </h1>
            <div className="flex flex-col sm:flex-row justify-center mt-4 gap-2">
                <Button variant={"active"} size={"xl"} onClick={()=>createGame()} ><MagicWandIcon size={32} />Create a Game</Button>
                
                <Button variant={"active"} onClick={()=>router.push("/join")}><GameControllerIcon size={32} />Join a Game</Button>
            </div>
        </div>
    )
}

export default StartScreen