import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { ArrowFatLeftIcon } from '@phosphor-icons/react/dist/ssr'

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
        <div className='flex items-center'>
            <div className='hidden sm:block'>
                <Button
                    onClick={handleClick}
                    leftIcon={<ArrowFatLeftIcon size={16} />}
                    variant='active'
                    size='xl'
                    className='w-auto'
                >
                    Back
                </Button>
            </div>

            <div className='block sm:hidden'>
                <Button
                    onClick={handleClick}
                    variant='active'
                    size='icon'
                >
                    <ArrowFatLeftIcon size={16} />
                </Button>
            </div>
        </div>
    )
}

export default NavigationBar