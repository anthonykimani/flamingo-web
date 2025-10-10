'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { UserIcon } from '@phosphor-icons/react'
import React from 'react'

const ScoreBoardPage = () => {
    return (
        <div className='result-background flex flex-col justify-around h-screen bg-no-repeat bg-cover'>
            <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                Flamingo
            </h1>
            <Card>
                <CardHeader className='text-3xl text-center'>
                    Scoreboard
                </CardHeader>
            </Card>
            <div className='flex flex-col items-center gap-3'>
                <div className='flex items-center justify-center gap-5 w-full'>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                    <h3 className='font-[Oi] text-white [text-stroke:_2px_black] text-3xl'>850</h3>
                </div>
                <div className='flex items-center justify-center gap-5 w-full'>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                    <h3 className='font-[Oi] text-white [text-stroke:_2px_black] text-3xl'>850</h3>
                </div>
            </div>
        </div>
    )
}

export default ScoreBoardPage