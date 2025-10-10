'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader } from '../ui/card'
import { UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

const GamePin = () => {
    const [readyToPlay, setReadyToPlay] = useState(true);
    const router = useRouter();

    const handlePlay = () => {
        router.push("/game")
    }

    return (
        <div className="flex flex-col p-2 gap-2  h-screen bg-no-repeat bg-cover justify-center items-center">
            <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-3xl sm:text-8xl ">
                Flamingo
            </h1>
            <div className="flex flex-col sm:flex-row justify-center w-full">
                <Button variant={"active"} className="m-2 text-xl" size={"xl"} >GAME PIN: 234732</Button>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-10'>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
                <div className='flex flex-col '>
                    <Card className='active:border-b-6 active:border-r-6'>
                        <CardHeader className='justify-center items-center px-10'>
                            <UserIcon size={32} />
                        </CardHeader>
                    </Card>
                    <h3 className='text-white text-xl text-center'> Jyuko </h3>
                </div>
            </div>
            {readyToPlay ? <Button onClick={() => handlePlay()} variant={"active"} buttoncolor={"gamePin"} className="m-2 text-xl" size={"xl"} >Press Space to Start</Button> : <Button variant={"active"} buttoncolor={"gamePin"} className="m-2 text-xl" size={"xl"} >Waiting for Players to Join</Button>}
        </div>
    )
}

export default GamePin