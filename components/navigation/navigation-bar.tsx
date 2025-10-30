import React from 'react'
import { Button } from '../ui/button'
import { ArrowFatLeftIcon } from '@phosphor-icons/react/dist/ssr'
import { useRouter } from 'next/navigation'

const NavigationBar = () => {
    const router = useRouter();
    return (
        <div>
            <div className='hidden sm:block'>
                <Button
                    onClick={() => router.back()}
                    leftIcon={<ArrowFatLeftIcon size={28} color="bg-transparent" />}
                    variant={"active"}
                >
                    Back
                </Button>
            </div>

            <div className='block sm:hidden'>
                <Button
                    onClick={() => router.back()}
                    centerIcon={<ArrowFatLeftIcon size={28} color="bg-transparent" />}
                    variant={"active"}
                >
                </Button>
            </div>
        </div>
    )
}

export default NavigationBar