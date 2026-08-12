import { ClockIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface GameTimerProps {
    seconds: number
    className?: string
}

const GameTimer = ({ seconds, className }: GameTimerProps) => {
    return (
        <div className={cn('bg-black/50 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shrink-0', className)}>
            <ClockIcon size={20} />
            {seconds}s
        </div>
    )
}

export { GameTimer }
