'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { JoystickIcon, SquareIcon, StarIcon, XIcon } from '@phosphor-icons/react'
import React from 'react'

const PlayGame = () => {
    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-around '>
            <div className='w-full md:w-1/2 flex flex-col justify-center gap-10'>
                <Card>
                    <CardHeader className='text-3xl text-center'>
                        Who is Satoshi
                    </CardHeader>
                </Card>
                <div className='flex justify-between'>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        8
                    </div>
                    <Button
                        variant="active"
                        size="xl"
                    >
                        2 Answers
                    </Button>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                    <Button
                        leftIcon={<SquareIcon size={32} />}
                        variant="active"
                        size="xl"
                    >
                        Jyuko
                    </Button>

                    <Button
                        leftIcon={<StarIcon size={32} />}
                        variant="active"
                        size="xl"
                    >
                        Jyuko
                    </Button>

                    <Button
                        leftIcon={<StarIcon size={32} />}
                        variant="active"
                        size="xl"
                    >
                        Jyuko
                    </Button>

                    <Button
                        leftIcon={<StarIcon size={32} />}
                        variant="active"
                        size="xl"
                    >
                        Jyuko
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default PlayGame