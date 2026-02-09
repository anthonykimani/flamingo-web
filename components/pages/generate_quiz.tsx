'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import {
  JoystickIcon,
  UserIcon,
  XIcon,
  CoinsIcon,
  SparkleIcon,
  LightningIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '../ui/input'
import { addAgentQuiz, createGameSession } from '@/services/quiz_service'
import NavigationBar from '../navigation/navigation-bar'
import { GameMode } from '@/enums/game_mode'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

const GenerateQuiz = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameMode = (searchParams.get('gameMode') as GameMode) || GameMode.HANGOUTS

  const [prompt, setPrompt] = useState('')
  const [hasPrizes, setHasPrizes] = useState(false)
  const [prizePool, setPrizePool] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const handleSubmit = async () => {
    // Validation
    if (!prompt.trim()) {
      alert('Please enter a prompt for quiz generation')
      return
    }

    if (hasPrizes && !prizePool.trim()) {
      alert('Please enter a prize pool amount')
      return
    }

    if (hasPrizes && parseFloat(prizePool) <= 0) {
      alert('Prize pool must be greater than 0')
      return
    }

    try {
      setIsSubmitting(true)

      // Create Quiz
      const quizResponse = await addAgentQuiz(prompt)
      console.log('Quiz created:', quizResponse.payload)

      // Create game session with config
      const gameConfig = {
        quizId: quizResponse.payload.id,
        gameMode,
        hasPrizes,
        ...(hasPrizes && {
          prizePool: parseFloat(prizePool),
          minPlayers: 3,
        }),
      }

      const sessionResponse = await createGameSession(gameConfig)
      console.log('Game session created:', sessionResponse.payload)

      // Navigate to lobby with game session
      router.push(
        `/lobby?sessionId=${sessionResponse.payload.id}&gamePin=${sessionResponse.payload.gamePin}&host=true`
      )
    } catch (error) {
      console.error('Failed to create quiz/session:', error)
      alert(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get game mode details
  const getGameModeDetails = () => {
    switch (gameMode) {
      case GameMode.HANGOUTS:
        return {
          icon: <UsersIcon size={32} weight="duotone" className="text-slate-700" />,
          title: 'Hangouts',
          description: 'Casual play with friends. Optional prizes & flexible settings.',
        }
      case GameMode.TEAM_BUILDING:
        return {
          icon: <UsersIcon size={32} weight="duotone" className="text-slate-700" />,
          title: 'Team Building',
          description: 'Collaborative gameplay perfect for team bonding.',
        }
      case GameMode.DEGEN_PVP:
        return {
          icon: <LightningIcon size={32} weight="duotone" className="text-slate-700" />,
          title: 'Degen PvP',
          description: 'High-stakes competitive gameplay with crypto prizes.',
        }
      default:
        return {
          icon: <UsersIcon size={32} weight="duotone" />,
          title: 'Unknown',
          description: '',
        }
    }
  }

  const gameModeDetails = getGameModeDetails()

  return (
    <div className="game-pin-background flex h-screen flex-col overflow-y-auto bg-cover bg-no-repeat p-2">
      <div className="mb-4 flex flex-row justify-between sm:items-center">
        <NavigationBar />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 p-2">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-[Oi] text-5xl text-white [-webkit-text-stroke:2px_black] sm:text-7xl sm:[-webkit-text-stroke:3px_black]">
            Create Your Game
          </h1>
          <p className="text-lg font-semibold text-white drop-shadow-lg sm:text-xl">
            Let AI generate your perfect quiz
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {/* Combined Game Mode & Prize Info Card */}
          <Card className="bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
            <CardContent className="space-y-4 p-3">
              {/* Game Mode Section */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl border-2 border-slate-300 bg-slate-100 p-3">
                  {gameModeDetails.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Label className="text-xl font-bold">Game Mode</Label>
                    <span className="rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold">
                      {gameModeDetails.title}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {gameModeDetails.description}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-slate-200" />

              {/* Prize Info Section */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg border-2 border-slate-300 bg-slate-100 p-2">
                  <CoinsIcon size={24} weight="duotone" className="text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {gameMode === GameMode.DEGEN_PVP
                      ? '🔥 This mode includes prizes by default'
                      : gameMode === GameMode.HANGOUTS
                        ? '💰 Optional prize pool available below'
                        : '🚧 Prize functionality coming soon for this mode'}
                  </p>
                  {gameMode === GameMode.DEGEN_PVP && (
                    <p className="mt-1 text-xs text-slate-600">
                      Minimum 3 players required to start
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Prompt Input */}
          <Input
            className="w-full"
            variant="generate"
            placeholder='Describe your quiz (e.g., "10 questions about Space Exploration" or "Fun trivia about 90s Pop Culture")'
            value={prompt}
            onChange={handlePromptChange}
          />

          {/* Prize Configuration - Only for Hangouts */}
          {gameMode === GameMode.HANGOUTS && (
            <Card className="bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-yellow-100 p-2">
                        <CoinsIcon size={28} weight="duotone" className="text-yellow-600" />
                      </div>
                      <div>
                        <Label
                          htmlFor="prizes-toggle"
                          className="block cursor-pointer text-lg font-bold"
                        >
                          Prize Pool
                        </Label>
                        <p className="text-xs text-slate-600">
                          Add crypto rewards to make it interesting
                        </p>
                      </div>
                    </div>
                    <Switch id="prizes-toggle" checked={hasPrizes} onCheckedChange={setHasPrizes} />
                  </div>

                  {hasPrizes && (
                    <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-3 border-t-2 border-slate-200 pt-4 duration-300">
                      <Label htmlFor="prize-pool" className="text-sm font-semibold text-slate-900">
                        Prize Pool Amount (ETH)
                      </Label>
                      <div className="relative">
                        <Input
                          id="prize-pool"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.1"
                          value={prizePool}
                          onChange={(e) => setPrizePool(e.target.value)}
                          className="w-full pl-12 text-lg font-semibold"
                        />
                        <CoinsIcon
                          size={24}
                          className="absolute top-1/2 left-3 -translate-y-1/2 text-yellow-600"
                          weight="duotone"
                        />
                      </div>
                      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
                        <p className="flex items-center gap-2 text-xs font-medium text-amber-800">
                          <span className="text-lg">⚠️</span>
                          <span>Minimum 3 players required when prizes are enabled</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="xsm:flex-row mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto">
          <Button
            leftIcon={<XIcon size={24} color="white" />}
            variant="destructive"
            size="xl"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            leftIcon={isSubmitting ? null : <JoystickIcon size={28} />}
            variant="active"
            size="xl"
            onClick={handleSubmit}
            disabled={isSubmitting || !prompt.trim()}
            className="relative w-full overflow-hidden sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚡</span>
                Generating Quiz...
              </span>
            ) : (
              'Create Game'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GenerateQuiz
