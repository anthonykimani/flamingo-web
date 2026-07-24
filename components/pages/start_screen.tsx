'use client'

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { StatusBadge } from '../ui/status-badge'
import { GameControllerIcon, MagicWandIcon, WarningCircleIcon, ArrowClockwiseIcon, PencilSimpleLineIcon, Shuffle, CheckIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { ConnectWalletButton } from '../custom/connect-wallet-button'
import { useAccount } from 'wagmi'
import { useWorldApp } from '@/hooks/use-world-app'
import { getPlayerName, setPlayerName, generateFunName, getPlayerId } from '@/lib/fun-names'

const StartScreen = () => {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { isInstalled, walletAddress, username, isAuthenticated, isAuthenticating, error } = useWorldApp()

  const [mounted, setMounted] = useState(false)
  const [playerName, setPlayerNameState] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  useEffect(() => setMounted(true), [])

  const isWorldApp = isInstalled
  const isLoading = isWorldApp && isAuthenticating && !isAuthenticated
  const hasError = isWorldApp && !!error && !isAuthenticated && !isAuthenticating

  useEffect(() => {
    setPlayerNameState(getPlayerName())
    getPlayerId()
  }, [])

  useEffect(() => {
    if (mounted && isWorldApp && username && !localStorage.getItem('flamingo_player_name')) {
      setPlayerName(username)
      setPlayerNameState(username)
    }
  }, [mounted, isWorldApp, username])

  const handleShuffle = () => {
    const newName = generateFunName()
    setPlayerNameState(newName)
    setPlayerName(newName)
  }

  const handleSaveName = () => {
    if (editName.trim().length >= 2) {
      setPlayerName(editName.trim())
      setPlayerNameState(editName.trim())
    }
    setIsEditingName(false)
  }

  return (
    <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover">
      <div className="flex items-start justify-between p-1 sm:p-3">
        <div className='flex items-center gap-2 animate-fadeIn'>
          {mounted && (
            isEditingName ? (
              <div className='flex items-center gap-2 bg-white/90 rounded-lg border-2 border-slate-800 border-b-[4px] border-r-[4px] px-4 py-2.5'>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={20}
                  className='text-base font-oldschool bg-transparent outline-none text-gray-800 w-32'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') setIsEditingName(false)
                  }}
                  onBlur={handleSaveName}
                />
                <button onClick={handleSaveName} className='cursor-pointer text-green-600 hover:text-green-800'>
                  <CheckIcon size={20} weight="bold" />
                </button>
              </div>
            ) : (
              <div className='relative'>
                <div className='flex items-center gap-1.5 bg-white/90 rounded-lg border-2 border-slate-800 border-b-[4px] border-r-[4px] px-4 py-2.5'>
                  <span className='text-base font-oldschool text-gray-800'>{playerName}</span>
                  <button
                    onClick={() => { setEditName(playerName); setIsEditingName(true) }}
                    className='cursor-pointer text-gray-700 hover:text-black'
                    title='Edit name'
                  >
                    <PencilSimpleLineIcon size={20} />
                  </button>
                </div>
                <button
                  onClick={handleShuffle}
                  className='absolute -top-2.5 -right-2.5 bg-white rounded-full p-1.5 border-2 border-slate-800 shadow-md cursor-pointer hover:bg-gray-50 transition-transform hover:scale-110 active:border-b active:border-r'
                  title='Randomize name'
                >
                  <ArrowClockwiseIcon size={14} weight="bold" className='text-black' />
                </button>
              </div>
            )
          )}
        </div>

        <div className='flex items-center gap-2 animate-fadeIn'>
          {mounted && (
            isWorldApp ? (
              <StatusBadge variant="wallet" className="text-xs !p-1.5">
                {isLoading && 'Connecting...'}
                {hasError && 'Connection failed'}
                {!isLoading && !hasError && (isAuthenticated ? 'World ID ✓' : 'Connecting...')}
              </StatusBadge>
            ) : isConnected ? (
              <ConnectWalletButton />
            ) : null
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
                <WarningCircleIcon size={16} />
                <span>{error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Retry connection"
                >
                  <ArrowClockwiseIcon size={14} />
                </button>
              </StatusBadge>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                variant="active"
                size="xl"
                onClick={() => router.push("/create")}
              >
                <MagicWandIcon size={32} />
                Create a Game
              </Button>

              <Button variant="active" onClick={() => router.push('/join')}>
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
