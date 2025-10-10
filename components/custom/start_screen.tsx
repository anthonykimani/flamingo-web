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
        <div className="flex flex-col p-2 gap-2 start-screen-background h-screen bg-no-repeat bg-cover justify-center items-center">
            <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-3xl sm:text-8xl ">
                Flamingo
            </h1>
            <div className="flex flex-col sm:flex-row justify-center w-full">
                <Button variant={"active"} className="m-2" size={"xl"} onClick={()=>createGame()} ><MagicWandIcon size={32} />Create a Game</Button>
                <Button variant={"default"} className="m-2" onClick={()=>router.push("/join")}><GameControllerIcon size={32} />Join a Game</Button>
            </div>
        </div>
    )
}

export default StartScreen