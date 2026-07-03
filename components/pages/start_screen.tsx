'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { StatusBadge } from '../ui/status-badge'
import { GameControllerIcon, MagicWandIcon, WarningCircle, ArrowClockwise, SpinnerBallIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ConnectWalletButton } from '../custom/connect-wallet-button'
import { useAccount } from 'wagmi'
import { useWorldApp } from '@/hooks/use-world-app'

const StartScreen = () => {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isInstalled, walletAddress, username, isAuthenticated, isAuthenticating, error } = useWorldApp()

  const [mounted, setMounted] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  useEffect(() => setMounted(true), [])

  const isWorldApp = isInstalled
  const hasCrypto = isWorldApp ? isAuthenticated : isConnected
  const userReady = hasCrypto || isGuest
  const isLoading = isWorldApp && isAuthenticating && !isAuthenticated
  const hasError = isWorldApp && !!error && !isAuthenticated && !isAuthenticating

  const displayName = isWorldApp
    ? username ?? (walletAddress?.slice(0, 6) ?? '') + '...'
    : undefined

  const handleGuestMode = () => {
    setIsGuest(true)
    localStorage.setItem('flamingo_guest', 'true')
  }

  return (
    <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover">
      <div>
        <div className='flex items-start justify-start gap-2 animate-fadeIn cursor-pointer p-1 sm:p-3'>
          {mounted && (
            isWorldApp ? (
              <StatusBadge variant="wallet">
                <span>
                  {isLoading && 'Connecting...'}
                  {hasError && 'Connection failed'}
                  {!isLoading && !hasError && (displayName ?? 'Connecting...')}
                </span>
              </StatusBadge>
            ) : isGuest ? (
              <StatusBadge variant="guest">
                Playing as Guest
              </StatusBadge>
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
              <StatusBadge variant="error">
                <WarningCircle size={16} weight="fill" />
                <span>{error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Retry connection"
                >
                  <ArrowClockwise size={14} />
                </button>
              </StatusBadge>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                variant="active"
                size="xl"
                onClick={() => router.push("/create")}
                disabled={!userReady}
              >
                {!userReady ? (
                  <span className="animate-pulse inline-flex items-center gap-2">
                    <SpinnerBallIcon size={32} className='animate-icon-spin' />
                    Connecting...
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

            {!userReady && !isWorldApp && (
              <div className='mt-4 flex flex-col items-center gap-2'>
                
                <Button
                  variant="active"
                  color="gametype"
                  size="xl"
                  onClick={handleGuestMode}
                >
                  Continue as Guest
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StartScreen
