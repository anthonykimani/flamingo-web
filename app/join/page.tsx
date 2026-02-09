'use client'

import { JoinGameStep } from '@/enums/join_game_step'
import { useJoinGame } from '@/hooks/use-join-game'
import { JoinGameForm } from '@/components/join/JoinGameForm'
import { JoinLobbyWaiting } from '@/components/join/JoinLobbyWaiting'

const JoinGamePage = () => {
  const {
    stepper,
    gamePin,
    nickname,
    error,
    isSubmitting,
    isSocketConnected,
    statusText,
    setGamePin,
    setNickname,
    submit,
  } = useJoinGame()

  switch (stepper) {
    case JoinGameStep.ENTERGAMEPIN:
      return (
        <JoinGameForm
          gamePin={gamePin}
          nickname={nickname}
          error={error}
          isSubmitting={isSubmitting}
          statusText={statusText}
          onGamePinChange={setGamePin}
          onNicknameChange={setNickname}
          onSubmit={submit}
        />
      )
    case JoinGameStep.LOBBYROOM:
      return <JoinLobbyWaiting nickname={nickname} isSocketConnected={isSocketConnected} />
    default:
      return null
  }
}

export default JoinGamePage
