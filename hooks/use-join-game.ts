'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useAccount, useSendTransaction, useWriteContract } from 'wagmi'
import { celoSepolia } from 'viem/chains'
import {
  createWalletClient,
  custom,
  encodeFunctionData,
  keccak256,
  maxUint256,
  stringToHex,
} from 'viem'

import { JoinGameStep } from '@/enums/join_game_step'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import { getGameSessionByGamePin } from '@/services/quiz_service'
import { ERC20ABI } from '@/utils/abi/ERC20'
import { flamingoEscrowABI } from '@/utils/abi/flamingo-escrow'
import socketClient from '@/utils/socket/socket.client'

type TxStage = 'idle' | 'approving' | 'depositing' | 'joining'

type JoinGameSession = {
  id: string
  gamePin: string
  status: GameState
}

function isMiniPay() {
  const eth = (typeof window !== 'undefined' ? (window as any).ethereum : null) as {
    isMiniPay?: boolean
  } | null
  return Boolean(eth && eth.isMiniPay)
}

function getMiniPayWalletClient() {
  const eth = (typeof window !== 'undefined' ? (window as any).ethereum : null) as any
  if (!isMiniPay() || !eth) return null

  return createWalletClient({
    chain: celoSepolia,
    transport: custom(eth),
  })
}

export function useJoinGame() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { sendTransaction, data: sendTransactionDepositHash } = useSendTransaction()

  const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.ENTERGAMEPIN)
  const [gamePin, setGamePin] = useState('')
  const [nickname, setNickname] = useState('')
  const [gameSession, setGameSession] = useState<JoinGameSession | null>(null)
  const [error, setError] = useState('')
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stage, setStage] = useState<TxStage>('idle')

  const env = useMemo(() => {
    const escrow = process.env.NEXT_PUBLIC_FLAMINGO_ESCROW_ADDRESS as `0x${string}` | undefined
    const usdc = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}` | undefined
    return { escrow, usdc }
  }, [])

  // Socket connection status
  useEffect(() => {
    const socket = socketClient.connect()

    const onConnect = () => setIsSocketConnected(true)
    const onDisconnect = () => setIsSocketConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // initialize state
    setIsSocketConnected(socket.connected)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  // Transition to play screen when game starts (while in lobby)
  useEffect(() => {
    if (stepper !== JoinGameStep.LOBBYROOM || !gameSession?.id) return

    socketClient.onGameStarted(() => {
      router.push(
        `/play?sessionId=${gameSession.id}&playerName=${nickname}&gamePin=${gameSession.gamePin}`
      )
    })

    return () => {
      socketClient.off(SocketEvents.GAME_STARTED)
    }
  }, [stepper, gameSession?.id, gameSession?.gamePin, nickname, router])

  const validate = useCallback(() => {
    if (!gamePin.trim()) return 'Please enter a game PIN'
    if (!nickname.trim()) return 'Please enter a nickname'
    if (nickname.length < 2) return 'Nickname must be at least 2 characters'
    if (nickname.length > 20) return 'Nickname must be 20 characters or less'
    if (!isConnected || !address) return 'Wallet connection lost. Please reconnect and try again.'
    if (!env.escrow || !env.usdc) return 'Missing escrow/USDC configuration. Check env vars.'
    return null
  }, [address, env.escrow, env.usdc, gamePin, isConnected, nickname])

  const submit = useCallback(async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      if (validationError.startsWith('Wallet connection lost')) {
        setTimeout(() => router.push('/'), 1200)
      }
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await getGameSessionByGamePin(gamePin)

      if (
        response.payload.status !== GameState.WAITING &&
        response.payload.status !== GameState.CREATED
      ) {
        setError('Game has already started or ended')
        setIsSubmitting(false)
        return
      }

      setGameSession({
        id: response.payload.id,
        gamePin: response.payload.gamePin,
        status: response.payload.status as GameState,
      })

      // APPROVE
      setStage('approving')
      try {
        let approveHash: string | undefined

        if (isMiniPay()) {
          const walletClient = getMiniPayWalletClient()
          if (!walletClient) throw new Error('MiniPay wallet not available')

          const approveData = encodeFunctionData({
            abi: ERC20ABI,
            functionName: 'approve',
            args: [env.escrow!, maxUint256],
          })

          approveHash = await walletClient.sendTransaction({
            to: env.usdc!,
            data: approveData,
            account: address as `0x${string}`,
          })
        } else {
          approveHash = await writeContractAsync({
            abi: ERC20ABI,
            address: env.usdc!,
            functionName: 'approve',
            args: [env.escrow!, maxUint256],
            account: address,
            chainId: celoSepolia.id,
          })
        }

        posthog?.capture('usdc_approval_success', {
          gameId: response.payload.id,
          txHash: approveHash,
          wallet: isMiniPay() ? 'minipay' : 'browser',
        })
      } catch (err) {
        posthog?.capture('usdc_approval_failed', {
          gameId: response.payload.id,
          error: err,
          wallet: isMiniPay() ? 'minipay' : 'browser',
        })
        setError(`USDC approval failed: ${err instanceof Error ? err.message : String(err)}`)
        setIsSubmitting(false)
        setStage('idle')
        return
      }

      // DEPOSIT
      setStage('depositing')
      try {
        const depositArgs = [keccak256(stringToHex(response.payload.id)), BigInt(1_000)] as const

        let depositHash: string | undefined

        if (isMiniPay()) {
          const walletClient = getMiniPayWalletClient()
          if (!walletClient) throw new Error('MiniPay wallet not available')

          const depositData = encodeFunctionData({
            abi: flamingoEscrowABI,
            functionName: 'deposit',
            args: depositArgs,
          })

          depositHash = await walletClient.sendTransaction({
            to: env.escrow!,
            data: depositData,
            account: address as `0x${string}`,
          })
        } else {
          depositHash = await writeContractAsync({
            abi: flamingoEscrowABI,
            address: env.escrow!,
            functionName: 'deposit',
            args: depositArgs,
            account: address,
            chainId: celoSepolia.id,
          })
        }

        posthog?.capture('deposit_success', {
          gameId: response.payload.id,
          txHash: depositHash || sendTransactionDepositHash,
          wallet: isMiniPay() ? 'minipay' : 'browser',
        })
      } catch (err) {
        posthog?.capture('deposit_failed', {
          gameId: response.payload.id,
          error: err,
          wallet: isMiniPay() ? 'minipay' : 'browser',
        })
        setError(`Deposit failed: ${err instanceof Error ? err.message : String(err)}`)
        setIsSubmitting(false)
        setStage('idle')
        return
      }

      // JOIN GAME
      setStage('joining')

      socketClient.joinGame(response.payload.id, nickname, address as `0x${string}`)

      socketClient.onJoinedGame((data) => {
        if (data.success) {
          setStepper(JoinGameStep.LOBBYROOM)
          setStage('idle')
        } else {
          setError('Failed to join game')
        }
        setIsSubmitting(false)
      })

      socketClient.onError((data) => {
        setError(data.message)
        setIsSubmitting(false)
        setStage('idle')
      })
    } catch (err) {
      setError('Invalid game PIN or game not found')
      setIsSubmitting(false)
      setStage('idle')
    }
  }, [
    address,
    env.escrow,
    env.usdc,
    gamePin,
    nickname,
    router,
    sendTransaction,
    sendTransactionDepositHash,
    validate,
    writeContractAsync,
  ])

  const statusText = useMemo(() => {
    if (!isSubmitting) return null
    if (stage === 'approving') return 'Approving USDC…'
    if (stage === 'depositing') return 'Depositing…'
    if (stage === 'joining') return 'Joining game…'
    return 'Processing…'
  }, [isSubmitting, stage])

  return {
    // state
    stepper,
    gamePin,
    nickname,
    error,
    isSubmitting,
    isSocketConnected,
    statusText,
    // actions
    setGamePin,
    setNickname,
    submit,
  }
}
