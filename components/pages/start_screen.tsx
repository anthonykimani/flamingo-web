'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { GameControllerIcon, MagicWandIcon, WarningCircle, ArrowClockwise } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ConnectWalletButton } from '../custom/connect-wallet-button'
import { useAccount } from 'wagmi'
import { useWorldApp } from '@/hooks/use-world-app'

const StartScreen = () => {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isInstalled, walletAddress, username, isAuthenticated, isAuthenticating, error } = useWorldApp()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isWorldApp = isInstalled
  const userReady = isWorldApp ? isAuthenticated : isConnected
  const isLoading = isWorldApp && isAuthenticating && !isAuthenticated
  const hasError = isWorldApp && !!error && !isAuthenticated && !isAuthenticating

  const displayName = isWorldApp
    ? username ?? walletAddress?.slice(0, 6) + '...' ?? ''
    : undefined

  return (
    <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover">
      <div>
        <div className='flex items-start justify-start gap-2 animate-fadeIn cursor-pointer p-1 sm:p-3'>
          {mounted && (
            isWorldApp ? (
              <div className="flex items-center gap-2 rounded-lg border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2 bg-white p-2">
                <span className="font-semibold text-sm">
                  {isLoading && 'Connecting...'}
                  {hasError && 'Connection failed'}
                  {!isLoading && !hasError && (displayName ?? 'Connecting...')}
                </span>
              </div>
            ) : (
              <ConnectWalletButton />
            )
          )}
        </div>
      </div>

      <div className="h-full flex flex-col justify-center md:items-center p-1 sm:p-3">
        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
          Flamingo
        </h1>

        {mounted && (
          <div className="flex flex-col items-center mt-4 gap-2">
            {hasError && (
              <div className="flex items-center gap-2 text-red-500 bg-white/90 p-2 rounded-lg text-sm font-semibold">
                <WarningCircle size={16} weight="fill" />
                <span>{error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Retry connection"
                >
                  <ArrowClockwise size={14} />
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                variant="active"
                size="xl"
                onClick={() => router.push("/create")}
                disabled={!userReady}
              >
                {!userReady ? (
                  <span className="animate-pulse">
                    {isLoading ? 'Connecting...' : 'Connecting...'}
                  </span>
                ) : (
                  <>
                    <MagicWandIcon size={32} />
                    Create a Game
                  </>
                )}
              </Button>

              <Button variant="active" onClick={() => router.push('/join')} disabled={!userReady}>
                <GameControllerIcon size={32} />
                Join a Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartScreen
