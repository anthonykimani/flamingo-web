'use client'

import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { GameControllerIcon, MagicWandIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useAppKitWallet } from "@reown/appkit-wallet-button/react"
import { useAppKitAccount } from '@reown/appkit/react'

const StartScreen = () => {
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()

  const { isReady, isPending, connect } = useAppKitWallet({
    namespace: 'eip155',
    onSuccess(parsedCaipAddress) {
      router.push('/create')
    },
    onError(error) {
      console.error('Connection error:', error)
      alert('Failed to connect. Please try again.')
    },
  })

  // Handle button click
  const handleRoute = async (route:string) => {
    if (!isReady) {
      alert('Wallet is still initializing...')
      return
    }

    if (isConnected) {
      router.push(route)
    } else {
      try {
        await connect('google') 
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover">
        {isConnected && (
          <p className="mt-3 text-sm text-white/70">
            Connected as <span className="font-mono">{address?.slice(0, 6)}...</span>
          </p>
        )}
      <div className="h-full flex flex-col justify-center md:items-center p-1 sm:p-3">
        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
          Flamingo
        </h1>

        <div className="flex flex-col sm:flex-row justify-center mt-4 gap-2">
          <Button
            variant="active"
            size="xl"
            onClick={()=>handleRoute("/create")}
            disabled={isPending || !isReady}
          >
            {isPending ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <MagicWandIcon size={32} />
                Create a Game
              </>
            )}
          </Button>

          <Button variant="active" onClick={() => handleRoute('/join')}>
            <GameControllerIcon size={32} />
            Join a Game
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StartScreen