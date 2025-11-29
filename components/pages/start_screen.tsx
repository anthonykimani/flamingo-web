'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { GameControllerIcon, MagicWandIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ConnectWalletButton } from '../custom/connect-wallet-button'
import { useAccount } from 'wagmi'

const StartScreen = () => {
  const router = useRouter()
  const { address, isConnected } = useAccount();

  //prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), [])

  // Handle button click
  const handleRoute = (route: string) => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    router.push(route);
  };

  return (
    <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover">
      <div>
        <div className='flex items-start justify-start gap-2 animate-fadeIn cursor-pointer p-1 sm:p-3'>
          {mounted && <ConnectWalletButton />}
        </div>
      </div>

      <div className="h-full flex flex-col justify-center md:items-center p-1 sm:p-3">
        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
          Flamingo
        </h1>

        {
          mounted && (
            <div className="flex flex-col sm:flex-row justify-center mt-4 gap-2">
              <Button
                variant="active"
                size="xl"
                onClick={() => handleRoute("/create")}
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
          )
        }
      </div>
    </div>
  )
}

export default StartScreen