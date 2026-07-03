'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from '@/components/ui/button'
import { GamePill } from '@/components/ui/game-pill'
import { Users } from '@phosphor-icons/react'

const CARD_COLORS = [
  'bg-[#F14100]',
  'bg-[#2819DB]',
  'bg-[#009900]',
  'bg-[#FF9700]',
  'bg-[#E950BE]',
  'bg-[#DA0202]',
  'bg-[#00B8D4]',
  'bg-[#7B1FA2]',
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
              className='min-w-0 flex-[0_0_70%] pl-4'
            >
              <div
                className={`
                  ${CARD_COLORS[index % CARD_COLORS.length]}
                  rounded-2xl p-6 sm:p-8
                  border-2 border-slate-800
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
                  <h2 className='text-2xl xsm:text-3xl sm:text-4xl font-bold text-white leading-tight break-words drop-shadow-lg'>
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
                  className='bg-white/90 text-black hover:bg-white border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2'
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
