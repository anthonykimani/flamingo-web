'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { CircleIcon, SquareIcon, StarIcon, ThumbsUpIcon, TriangleIcon } from '@phosphor-icons/react'
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
                        centerIcon={<SquareIcon size={48} color='white' weight='fill' />}
                        variant="active"
                        size="gameanswer"
                        className='bg-[#009900]'
                    >

                    </Button>

                    <Button
                        centerIcon={<CircleIcon size={48} weight="fill" color='white' />}
                        variant="active"
                        size="gameanswer"
                        className='bg-[#F14100]'
                    >

                    </Button>

                    <Button
                        centerIcon={<TriangleIcon size={48} weight="fill" color='white' />}
                        variant="active"
                        size="gameanswer"
                        className='bg-[#2819DB]'
                    >

                    </Button>

                    <Button
                        centerIcon={<StarIcon size={48} color='white' weight='fill' />}
                        variant="active"
                        size="gameanswer"
                        className='bg-[#FF9700]'
                    >

                    </Button>
                </div>
            </div>

        </div>

        // <div className='game-pin-background h-screen bg-no-repeat bg-cover flex flex-col justify-around '>
        //     <Card>
        //         <CardHeader className='text-3xl text-center'>
        //             Correct
        //         </CardHeader>
        //     </Card>

        //     <div className='w-full grid grid-cols-2 gap-2 p-2'>
        //         <Button
        //             centerIcon={<TriangleIcon size={48} weight="fill" color='white' />}
        //             variant="active"
        //             size="gameanswer"
        //             className='bg-[#2819DB]'
        //         >
        //         </Button>
        //         <Button
        //             centerIcon={<SquareIcon size={48} weight="fill" color='white' />}
        //             variant="active"
        //             size="gameanswer"
        //             className='bg-[#009900]'
        //         >
        //         </Button>
        //         <Button
        //             centerIcon={<CircleIcon size={48} weight="fill" color='white' />}
        //             variant="active"
        //             size="gameanswer"
        //             className='bg-[#F14100]'
        //         >
        //         </Button>
        //         <Button
        //             centerIcon={<StarIcon size={48} weight="fill" color='white' />}
        //             variant="active"
        //             size="gameanswer"
        //             className='bg-[#FF9700]'
        //         >
        //         </Button>
        //     </div>

        //     <div className='flex justify-between'>
        //         <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
        //             8
        //         </div>
        //         <Button
        //             variant="active"
        //             size="xl"
        //         >
        //             2 Answers
        //         </Button>
        //     </div>

        //     <Card>
        //         <CardHeader className='text-3xl text-center'>
        //             + 870
        //         </CardHeader>
        //     </Card>

        //     <h4>You're on the Podium</h4>
        // </div>

        // <div className='result-background h-screen bg-no-repeat bg-cover flex flex-col justify-around '>
        //     <Card>
        //         <CardHeader className='text-3xl text-center'>
        //             Correct
        //         </CardHeader>
        //     </Card>

        //     <div className='w-full flex justify-center items-center'>
        //         <Button
        //             centerIcon={<ThumbsUpIcon size={48} weight="fill" color='white' />}
        //             variant="active"
        //             size="resultButton"
        //             className='bg-[#2819DB]'
        //         >
        //         </Button>
        //     </div>


        //     <div className='flex justify-between items-center'>
        //         <Button
        //             variant="active"
        //             size="xl"
        //         >
        //             Answer Streak:
        //         </Button>
        //         <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
        //             8
        //         </div>
        //     </div>

        //     <Card>
        //         <CardHeader className='text-3xl text-center'>
        //             + 870
        //         </CardHeader>
        //     </Card>

        //     <h4>You're on the Podium</h4>
        // </div>
    )
}

export default PlayGame