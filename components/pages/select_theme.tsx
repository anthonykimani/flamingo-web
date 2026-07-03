'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { XIcon } from '@phosphor-icons/react'
import { AtomIcon, FilmSlateIcon, FlaskIcon, GlobeHemisphereWestIcon, LightbulbIcon, MusicNoteIcon, ScrollIcon, TrophyIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addAgentQuiz, createGameSession } from '@/services/quiz_service'
import NavigationBar from '../navigation/navigation-bar'
import { GameMode } from '@/enums/game_mode'
import { Card, CardContent, CardTitle } from '../ui/card'

interface Theme {
  id: string
  icon: React.ReactNode
  label: string
  prompt: string
}

const themes: Theme[] = [
  { id: 'science',     icon: <AtomIcon size={32} />,                label: 'Science & Tech',    prompt: '10 quiz questions about science and technology covering physics, chemistry, biology, and computers' },
  { id: 'history',     icon: <ScrollIcon size={32} />,              label: 'History',           prompt: '10 quiz questions about world history including ancient civilizations, wars, and famous leaders' },
  { id: 'popculture',  icon: <MusicNoteIcon size={32} />,           label: 'Pop Culture',       prompt: '10 quiz questions about pop culture including music, TV shows, and internet trends' },
  { id: 'sports',      icon: <TrophyIcon size={32} />,              label: 'Sports',            prompt: '10 quiz questions about sports including football, basketball, soccer, and olympic games' },
  { id: 'geography',   icon: <GlobeHemisphereWestIcon size={32} />, label: 'Geography',         prompt: '10 quiz questions about world geography including countries, capitals, and landmarks' },
  { id: 'movies',      icon: <FilmSlateIcon size={32} />,           label: 'Movies',            prompt: '10 quiz questions about movies and cinema including classic films, directors, and actors' },
  { id: 'general',     icon: <LightbulbIcon size={32} />,           label: 'General Knowledge', prompt: '10 quiz questions about general knowledge covering a wide range of fun topics' },
  { id: 'nature',      icon: <FlaskIcon size={32} />,               label: 'Nature & Animals',  prompt: '10 quiz questions about nature, animals, plants, and the environment' },
]

const SelectTheme = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameMode = (searchParams.get('gameMode') as GameMode) || GameMode.HANGOUTS
  const [loadingTheme, setLoadingTheme] = useState<string | null>(null)

  const handleThemeSelect = async (theme: Theme) => {
    setLoadingTheme(theme.id)
    try {
      const quizResponse = await addAgentQuiz(theme.prompt)
      console.log('Quiz created:', quizResponse.payload)

      const gameConfig = {
        quizId: quizResponse.payload.id,
        gameMode,
        hasPrizes: false,
      }

      const sessionResponse = await createGameSession(gameConfig)
      console.log('Game session created:', sessionResponse.payload)

      router.push(`/lobby?sessionId=${sessionResponse.payload.id}&gamePin=${sessionResponse.payload.gamePin}&host=true`)
    } catch (error) {
      console.error('Failed to create quiz/session:', error)
      alert(error)
    } finally {
      setLoadingTheme(null)
    }
  }

  return (
    <div className='game-pin-background h-screen bg-no-repeat bg-cover flex flex-col p-2 overflow-y-auto'>
      <div className='flex flex-row justify-between sm:items-center mb-4'>
        <NavigationBar />
      </div>

      <div className='flex flex-col justify-center items-center p-2 flex-1 gap-6 max-w-4xl mx-auto w-full'>
        <div className='text-center space-y-2'>
          <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-5xl sm:text-7xl">
            Choose a Theme
          </h1>
          <p className='text-white text-lg sm:text-xl font-oldschool drop-shadow-lg'>
            Pick a topic to create your quiz
          </p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`items-center text-center cursor-pointer transition-all hover:scale-105 ${
                loadingTheme === theme.id ? 'opacity-60 pointer-events-none' : ''
              }`}
              onClick={() => handleThemeSelect(theme)}
            >
              <CardContent className='flex flex-col items-center gap-2 pt-6'>
                {theme.icon}
                <CardTitle className='text-sm sm:text-base'>
                  {loadingTheme === theme.id ? 'Generating...' : theme.label}
                </CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          leftIcon={<XIcon size={24} color='white' />}
          variant="destructive"
          size="xl"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default SelectTheme
