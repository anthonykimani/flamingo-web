'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { UserIcon } from '@phosphor-icons/react'

type JoinLobbyWaitingProps = {
  nickname: string
  isSocketConnected: boolean
}

export function JoinLobbyWaiting({ nickname, isSocketConnected }: JoinLobbyWaitingProps) {
  return (
    <div className="game-type-background flex h-screen w-screen flex-col justify-center gap-2 bg-cover bg-no-repeat p-1 sm:p-3 md:flex">
      <h1 className="xsm:text-6xl text-center font-[Oi] text-4xl text-white [-webkit-text-stroke:2px_black] sm:text-8xl sm:[-webkit-text-stroke:3px_black]">
        Flamingo
      </h1>

      <div className="flex flex-col items-center gap-3">
        <Card className="p-6 text-black active:border-t-2 active:border-r-6 active:border-b-6 active:border-l-2">
          <CardHeader className="items-center justify-center px-10">
            <UserIcon size={32} weight="bold" />
          </CardHeader>
        </Card>
        <h3 className="text-center text-2xl font-bold text-white">{nickname}</h3>
      </div>

      <div className="flex justify-around">
        <Card className="w-full max-w-md">
          <CardHeader className="px-8 text-center">
            <p className="mb-2 text-2xl font-semibold">You&apos;re in! 🎉</p>
            <p className="mb-2 text-lg font-semibold">
              See your nickname on the host&apos;s screen?
            </p>
            <p className="mb-2 text-lg font-semibold">Waiting for the game to start…</p>
            <div className="flex animate-pulse items-center justify-center gap-2 text-sm text-black/80">
              <span>⏳</span>
              <span>Get ready!</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <p className="absolute top-4 right-4 rounded bg-black/50 p-2 text-xs text-white">
        {isSocketConnected ? '🟢 Connected to game' : '🔴 Reconnecting…'}
      </p>
    </div>
  )
}
