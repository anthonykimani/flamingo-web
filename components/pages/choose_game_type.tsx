'use client'

import React from 'react'
import { Button } from '../ui/button'
import { RankingIcon, StrategyIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { GameMode } from '@/enums/game_mode'

interface ChooseGameTypeProps {
    onGameTypeSelect: (gameMode: GameMode) => void;
}

const ChooseGameType = ({ onGameTypeSelect }: ChooseGameTypeProps) => {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center h-full sm:h-1/2 relative">
            <div className="flex-1 flex flex-col justify-center items-center gap-6 w-full px-4">
                <h1 className="font-[Oi] text-white [-webkit-text-stroke:1.5px_black] sm:[-webkit-text-stroke:2px_black] text-3xl xsm:text-5xl sm:text-6xl text-center">
                    Choose Game Type
                </h1>
                <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-2xl">
                    <Button
                        onClick={() => onGameTypeSelect(GameMode.HANGOUTS)}
                        variant={"active"}
                        size={"gametype"}
                    >
                        <UsersThreeIcon size={32} />Hangouts
                    </Button>
                    <Button
                        showComingSoon
                        disabled
                        onClick={() => onGameTypeSelect(GameMode.TEAM_BUILDING)}
                        variant={"active"}
                        size={"gametype"}
                    >
                        <StrategyIcon size={32} />Team Building
                    </Button>
                    <Button
                        showComingSoon
                        disabled
                        onClick={() => onGameTypeSelect(GameMode.DEGEN_PVP)}
                        variant={"active"}
                        size={"gametype"}
                    >
                        <RankingIcon size={32} />Degen PvP
                    </Button>
                </div>
            </div>
            <div className="pb-6">
                <Button onClick={() => router.back()} variant={"active"} color={"gametype"} size={"xl"}>
                    Main Menu
                </Button>
            </div>
        </div>
    )
}

export default ChooseGameType
