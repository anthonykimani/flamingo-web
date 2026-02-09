'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { GameControllerIcon, MagicWandIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ConnectWalletButton } from '../custom/connect-wallet-button'
import { useAccount } from 'wagmi'

const StartScreen = () => {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  //prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Handle button click
  const handleRoute = (route: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first.')
      return
    }
    router.push(route)
  }

  return (
    <div className="start-screen-background flex h-screen w-screen flex-col bg-cover bg-no-repeat">
      <div>
        <div className="animate-fadeIn flex cursor-pointer items-start justify-start gap-2 p-1 sm:p-3">
          {mounted && <ConnectWalletButton />}
        </div>
      </div>

      <div className="flex h-full flex-col justify-center p-1 sm:p-3 md:items-center">
        <h1 className="xsm:text-6xl text-center font-[Oi] text-4xl text-white [-webkit-text-stroke:2px_black] sm:text-8xl sm:[-webkit-text-stroke:3px_black]">
          Flamingo
        </h1>

        {mounted && (
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              variant="active"
              size="xl"
              onClick={() => handleRoute('/create')}
              disabled={!isConnected}
            >
              {!isConnected ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <MagicWandIcon size={32} />
                  Create a Game
                </>
              )}
            </Button>

            <Button variant="active" onClick={() => handleRoute('/join')} disabled={!isConnected}>
              <GameControllerIcon size={32} />
              Join a Game
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartScreen
