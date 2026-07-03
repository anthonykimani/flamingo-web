'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from '@/components/ui/button'
import { GamePill } from '@/components/ui/game-pill'
import { Users } from '@phosphor-icons/react'

const CARD_GRADIENTS = [
  'from-[#FF00B7] to-[#FF6B6B]',
  'from-[#2819DB] to-[#6C63FF]',
  'from-[#DA0202] to-[#FF6B35]',
  'from-[#FF9700] to-[#FFD700]',
  'from-[#7C3AED] to-[#EC4899]',
  'from-[#059669] to-[#34D399]',
  'from-[#0369A1] to-[#38BDF8]',
  'from-[#BE123C] to-[#FB7185]',
]

interface SwipeGamesProps {
  games: any[]
  onJoin: (gamePin: string) => void
  isSubmitting: boolean
}

const SwipeGames = ({ games, onJoin, isSubmitting }: SwipeGamesProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  )

  return (
    <div className='w-full max-w-lg'>
      {/* Carousel Viewport */}
      <div className='overflow-hidden rounded-3xl' ref={emblaRef}>
        <div className='flex'>
          {games.map((game, index) => (
            <div
              key={game.id}
              className='min-w-0 flex-[0_0_85%] pl-4'
            >
              <div
                className={`
                  bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}
                  rounded-2xl p-6 sm:p-8
                  border-2 border-black/20
                  border-b-[6px] border-r-[6px]
                  active:border-b-2 active:border-r-2
                  transition-all duration-150
                  min-h-[320px] sm:min-h-[360px]
                  flex flex-col justify-between
                  select-none
                `}
              >
                {/* Card Content */}
                <div className='flex-1'>
                  <h2
                    className='
                      font-[Oi]
                      text-white
                      [-webkit-text-stroke:2px_black]
                      sm:[-webkit-text-stroke:3px_black]
                      text-2xl xsm:text-3xl sm:text-4xl
                      leading-tight
                      break-words
                    '
                  >
                    {game.gameTitle}
                  </h2>

                  <div className='mt-4 flex items-center gap-3'>
                    <GamePill variant="default">
                      <Users size={16} weight='fill' />
                      {game.playerCount} {game.playerCount === 1 ? 'player' : 'players'}
                    </GamePill>
                    <GamePill variant="meta">
                      {game.gameMode}
                    </GamePill>
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  variant="active"
                  size="xl"
                  className='bg-white/90 text-black hover:bg-white border-2 border-black/30 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2'
                  onClick={() => onJoin(game.gamePin)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join Game'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot Navigation */}
      {scrollSnaps.length > 1 && (
        <div className='flex justify-center gap-2 mt-4'>
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-200
                ${index === selectedIndex
                  ? 'bg-white scale-125 w-6'
                  : 'bg-white/40 hover:bg-white/60'
                }
              `}
              onClick={() => scrollTo(index)}
              aria-label={`Go to game ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SwipeGames
