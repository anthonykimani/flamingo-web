import React from 'react'
import { Button } from '../ui/button'
import { ArrowFatLeftIcon } from '@phosphor-icons/react/dist/ssr'
import { useRouter } from 'next/navigation'

interface NavigationBarProps {
    route?: string
}

const NavigationBar = ({ route }: NavigationBarProps) => {
    const router = useRouter();
    const handleClick = () => {
        if (route) {
            router.push(route)
        } else {
            router.back()
        }
    }
    return (
        <div>
            <div className='hidden sm:block'>
                <Button
                    onClick={handleClick}
                    leftIcon={<ArrowFatLeftIcon size={20} color="bg-transparent" />}
                    variant={"default"}
                    size='default'
                >
                    Back
                </Button>
            </div>

            <div className='block sm:hidden'>
                <Button
                    onClick={handleClick}
                    centerIcon={<ArrowFatLeftIcon size={18} color="bg-transparent" />}
                    variant={"default"}
                    size='icon'
                >
                </Button>
            </div>
        </div>
    )
}

export default NavigationBar