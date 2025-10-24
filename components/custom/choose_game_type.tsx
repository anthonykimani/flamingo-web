'use client'

import React from 'react'
import { Button } from '../ui/button'
import { RankingIcon, StrategyIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

const ChooseGameType = ({ onComplete }: { onComplete: () => void }) => {
    const router = useRouter()
    return (
        <div className="flex flex-col justify-around items-center">
            <h1 className="font-[Oi] text-white [-webkit-text-stroke:1.5px_black] sm:[-webkit-text-stroke:2px_black] text-3xl xsm:text-5xl sm:text-6xl text-center">
                Choose Game Type
            </h1>
            <div className="flex flex-col sm:flex-row justify-center w-full">
                <Button onClick={onComplete} variant={"active"} size={"gametype"} ><UsersThreeIcon size={32} />Hangouts</Button>
                <Button onClick={onComplete} variant={"active"} size={"gametype"}><StrategyIcon size={32} />Team Building</Button>
                <Button onClick={onComplete} variant={"active"} size={"gametype"}><RankingIcon size={32} />Degen PvP</Button>
            </div>
            <Button onClick={()=>router.back()} variant={"active"} color={"gametype"} size={"xl"} >Main Menu</Button>
        </div>
    )
}

export default ChooseGameType