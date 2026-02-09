'use client'

import NavigationBar from '@/components/navigation/navigation-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type JoinGameFormProps = {
  gamePin: string
  nickname: string
  error?: string
  isSubmitting?: boolean
  statusText?: string | null
  onGamePinChange: (v: string) => void
  onNicknameChange: (v: string) => void
  onSubmit: () => void
}

export function JoinGameForm({
  gamePin,
  nickname,
  error,
  isSubmitting,
  statusText,
  onGamePinChange,
  onNicknameChange,
  onSubmit,
}: JoinGameFormProps) {
  return (
    <div className="game-pin-background flex h-screen flex-col justify-center bg-cover bg-no-repeat p-2">
      <div className="flex h-screen flex-col justify-around">
        <div className="flex flex-row justify-between sm:items-center">
          <NavigationBar />
        </div>

        <div className="flex h-full flex-col justify-center p-1 sm:p-3 md:items-center">
          <h1 className="xsm:text-6xl text-center font-[Oi] text-4xl text-white [-webkit-text-stroke:2px_black] sm:text-8xl sm:[-webkit-text-stroke:3px_black]">
            Flamingo
          </h1>

          <div className="mt-4 flex w-full max-w-md flex-col justify-end gap-2">
            <Input
              name="gamepin"
              variant="default"
              placeholder="Enter Game PIN"
              value={gamePin}
              onChange={(e) => onGamePinChange(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              autoFocus
            />

            <Input
              name="nickname"
              variant="default"
              placeholder="Choose nickname"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit()
              }}
            />

            {error && (
              <p className="rounded bg-white/90 p-2 text-center font-semibold text-red-600">
                {error}
              </p>
            )}

            <Button
              variant="active"
              size="xl"
              className="bg-[#FF00B7] text-white"
              onClick={onSubmit}
              disabled={!gamePin.trim() || !nickname.trim() || Boolean(isSubmitting)}
            >
              {isSubmitting ? statusText || 'Processing…' : 'Join game'}
            </Button>

            <p className="mt-2 text-center text-xs text-white/90">
              Tip: use a short unique nickname so the host can spot you easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
