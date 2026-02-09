'use client'

import React from 'react'
import { Button } from '../ui/button'
import { RankingIcon, StrategyIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { GameMode } from '@/enums/game_mode'

interface ChooseGameTypeProps {
  onGameTypeSelect: (gameMode: GameMode) => void
}

const ChooseGameType = ({ onGameTypeSelect }: ChooseGameTypeProps) => {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col items-center justify-around sm:h-1/2">
      <h1 className="xsm:text-5xl text-center font-[Oi] text-3xl text-white [-webkit-text-stroke:1.5px_black] sm:text-6xl sm:[-webkit-text-stroke:2px_black]">
        Choose Game Type
      </h1>
      <div className="flex w-full flex-col justify-center sm:flex-row">
        <Button
          onClick={() => onGameTypeSelect(GameMode.HANGOUTS)}
          variant={'active'}
          size={'gametype'}
        >
          <UsersThreeIcon size={32} />
          Hangouts
        </Button>
        <Button
          showComingSoon
          disabled
          onClick={() => onGameTypeSelect(GameMode.TEAM_BUILDING)}
          variant={'active'}
          size={'gametype'}
        >
          <StrategyIcon size={32} />
          Team Building
        </Button>
        <Button
          onClick={() => onGameTypeSelect(GameMode.DEGEN_PVP)}
          variant={'active'}
          size={'gametype'}
        >
          <RankingIcon size={32} />
          Degen PvP
        </Button>
      </div>
      <Button onClick={() => router.back()} variant={'active'} color={'gametype'} size={'xl'}>
        Main Menu
      </Button>
    </div>
  )
}

export default ChooseGameType
