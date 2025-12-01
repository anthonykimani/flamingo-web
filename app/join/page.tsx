'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { JoinGameStep } from '@/enums/join_game_step'
import { UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSessionByGamePin } from '@/services/quiz_service'
import { GameState } from '@/enums/game_state'
import socketClient from '@/utils/socket/socket.client'
import { SocketEvents } from '@/enums/socket-events'
import NavigationBar from '@/components/navigation/navigation-bar'
import { useAccount, useWriteContract } from 'wagmi'
import { config } from '@/provider/rainbow'
import { flamingoEscrowABI } from '@/utils/abi/flamingo-escrow'
import { ERC20ABI } from '@/utils/abi/ERC20'
import { keccak256, maxUint256, stringToHex, createWalletClient, custom, encodeFunctionData } from 'viem'
import posthog from 'posthog-js'
import { celoSepolia } from 'viem/chains'
import { waitForTransactionReceipt } from '@wagmi/core'

// Helper to detect MiniPay
const isMiniPay = () => {
    return typeof window !== 'undefined' &&
        window.ethereum &&
        (window.ethereum as any).isMiniPay === true
}

// Helper to get wallet client for MiniPay
const getWalletClient = () => {
    if (!isMiniPay() || !window.ethereum) return null

    return createWalletClient({
        chain: celoSepolia,
        transport: custom(window.ethereum)
    })
}

const JoinGame = () => {
    const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.ENTERGAMEPIN)
    const { address, isConnected } = useAccount();
    const [gamePin, setGamePin] = useState('')
    const [nickname, setNickname] = useState('')
    const [gameSession, setGameSession] = useState<any>(null)
    const [error, setError] = useState('')
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const { writeContractAsync } = useWriteContract()

    useEffect(() => {
        const socket = socketClient.connect()

        socket.on('connect', () => {
            console.log('🦦 Player WebSocket connected')
            setIsSocketConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('🦦 Player WebSocket disconnected')
            setIsSocketConnected(false)
        })

        return () => { }
    }, [])

    useEffect(() => {
        if (stepper !== JoinGameStep.LOBBYROOM || !gameSession?.id) return

        socketClient.onGameStarted((data) => {
            console.log('🚀 Game started via WebSocket:', data)
            router.push(`/play?sessionId=${gameSession.id}&playerName=${nickname}&gamePin=${gameSession.gamePin}`)
        })

        return () => {
            socketClient.off(SocketEvents.GAME_STARTED)
        }
    }, [stepper, gameSession, nickname, router])

    const handleNextStep = async () => {
        switch (stepper) {
            case JoinGameStep.ENTERGAMEPIN:
                if (!gamePin.trim()) {
                    setError('Please enter a game PIN')
                    return
                }

                if (!nickname.trim()) {
                    setError('Please enter a nickname')
                    return
                }

                if (nickname.length < 2) {
                    setError('Nickname must be at least 2 characters')
                    return
                }

                if (nickname.length > 20) {
                    setError('Nickname must be 20 characters or less')
                    return
                }

                if (!isConnected && !address) {
                    setError('Wallet connection lost. Please return to start.')
                    setTimeout(() => router.push('/'), 2000)
                    return
                }

                setIsSubmitting(true)
                try {
                    setError('')
                    const response = await getGameSessionByGamePin(gamePin)
                    console.log('Game session:', response.payload)

                    if (response.payload.status !== GameState.WAITING && response.payload.status !== GameState.CREATED) {
                        setError('Game has already started or ended')
                        setIsSubmitting(false)
                        return
                    }

                    setGameSession(response.payload)

                    console.log("ESCROW:", process.env.NEXT_PUBLIC_FLAMINGO_ESCROW_ADDRESS)
                    console.log("USDC:", process.env.NEXT_PUBLIC_USDC_ADDRESS)
                    console.log("User:", address)
                    console.log("Is MiniPay:", isMiniPay())

                    // APPROVAL FLOW
                    try {
                        console.log('🟡 Approving USDC...')

                        let approveHash: string | undefined

                        if (isMiniPay()) {
                            // MiniPay: Use sendTransaction
                            const walletClient = getWalletClient()
                            if (!walletClient) throw new Error('MiniPay wallet not available')

                            const approveData = encodeFunctionData({
                                abi: ERC20ABI,
                                functionName: 'approve',
                                args: [
                                    process.env.NEXT_PUBLIC_FLAMINGO_ESCROW_ADDRESS as `0x${string}`,
                                    maxUint256
                                ],
                            })

                            approveHash = await walletClient.sendTransaction({
                                to: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
                                data: approveData,
                                account:null,
                            })

                            console.log("✅ Approval tx sent via MiniPay:", approveHash)
                            posthog?.capture('approve_hash_on_minipay', {
                                hash: approveHash
                            })
                        } else {
                            // Browser: Use writeContractAsync
                            approveHash = await writeContractAsync({
                                abi: ERC20ABI,
                                address: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
                                functionName: 'approve',
                                args: [process.env.NEXT_PUBLIC_FLAMINGO_ESCROW_ADDRESS as `0x${string}`, maxUint256],
                                account: address,
                                chainId: celoSepolia.id,
                            })

                            console.log("✅ Approval tx sent via writeContractAsync:", approveHash)
                        }

                        // Wait for confirmation (both paths)
                        const transactionReceipt = await waitForTransactionReceipt(config, {
                            chainId: celoSepolia.id,
                            hash: approveHash as `0x${string}`
                        })

                        console.log(`✅ USDC approved & confirmed: ${approveHash}`)
                        posthog?.capture('usdc_approval_success', {
                            gameId: response.payload.id,
                            txHash: approveHash,
                            receipt: transactionReceipt,
                            wallet: isMiniPay() ? 'minipay' : 'browser'
                        })

                    } catch (err) {
                        console.error('❌ Approval failed:', err)
                        posthog?.capture('usdc_approval_failed', {
                            gameId: response.payload.id,
                            error: err,
                            wallet: isMiniPay() ? 'minipay' : 'browser'
                        })
                        setError(`USDC approval failed: ${err instanceof Error ? err.message : err}`)
                        setIsSubmitting(false)
                        return
                    }

                    // DEPOSIT FLOW
                    try {
                        console.log('🟡 Depositing USDC...')
                        posthog?.capture('deposit_started', {
                            gameId: response.payload.id,
                            wallet: isMiniPay() ? 'minipay' : 'browser'
                        })

                        let depositHash: string | undefined

                        if (isMiniPay()) {
                            // MiniPay: Use sendTransaction
                            const walletClient = getWalletClient()
                            if (!walletClient) throw new Error('MiniPay wallet not available')

                            const depositData = encodeFunctionData({
                                abi: flamingoEscrowABI,
                                functionName: 'deposit',
                                args: [keccak256(stringToHex(response.payload.id)), BigInt(1_000)],
                            })

                            depositHash = await walletClient.sendTransaction({
                                to: process.env.NEXT_PUBLIC_FLAMINGO_ESCROW_ADDRESS as `0x${string}`,
                                data: depositData,
                                account:null,
                            })

                            console.log("✅ Deposit tx sent via MiniPay:", depositHash)
                            posthog?.capture("deposit_via_minipay", { hash: depositHash })
                        } else {
                            // Browser: Use writeContractAsync
                            depositHash = await writeContractAsync({
                                abi: flamingoEscrowABI,
                                address: process.env.NEXT_PUBLIC_FLAMINGO_ESCROW_ADDRESS as `0x${string}`,
                                functionName: 'deposit',
                                args: [keccak256(stringToHex(response.payload.id)), BigInt(1_000)],
                                account: address,
                                chainId: celoSepolia.id,
                            })

                            console.log("✅ Deposit tx sent via writeContractAsync:", depositHash)
                            posthog?.capture("deposit_via_browser", { hash: depositHash })
                        }

                        // Wait for confirmation
                        // await waitForTransactionReceipt(config, {
                        //     chainId: celoSepolia.id,
                        //     hash: depositHash as `0x${string}`
                        // })

                        console.log(`✅ Deposit successful: ${depositHash}`)
                        posthog?.capture('deposit_success', {
                            gameId: response.payload.id,
                            txHash: depositHash,
                            status: true,
                            wallet: isMiniPay() ? 'minipay' : 'browser'
                        })

                    } catch (err) {
                        console.error('❌ Deposit failed:', err)
                        posthog?.capture('deposit_failed', {
                            gameId: response.payload.id,
                            error: err,
                            wallet: isMiniPay() ? 'minipay' : 'browser'
                        })
                        setError(`Deposit failed: ${err instanceof Error ? err.message : err}`)
                        setIsSubmitting(false)
                        return
                    }

                    // Join game via WebSocket
                    socketClient.joinGame(response.payload.id, nickname, address as `0x${string}`)

                    socketClient.onJoinedGame((data) => {
                        console.log('✅ Joined game via WebSocket:', data)
                        if (data.success) {
                            setStepper(JoinGameStep.LOBBYROOM)
                        } else {
                            setError('Failed to join game')
                        }
                        setIsSubmitting(false)
                    })

                    socketClient.onError((data) => {
                        console.error('❌ Join error:', data.message)
                        setError(data.message)
                        setIsSubmitting(false)
                    })

                } catch (err) {
                    console.error('Add player error:', err)
                    setError('Invalid game PIN or game not found')
                    setIsSubmitting(false)
                }
                break
        }
    }

    const renderStep = () => {
        switch (stepper) {
            case JoinGameStep.ENTERGAMEPIN:
                return (
                    <div className='game-pin-background h-screen bg-no-repeat bg-cover flex flex-col justify-center p-2'>
                        <div className='flex flex-col h-screen justify-around'>
                            <div className='flex flex-row justify-between sm:items-center'>
                                <NavigationBar />
                            </div>
                            <div className="h-full flex flex-col justify-center md:items-center p-1 sm:p-3">
                                <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
                                    Flamingo
                                </h1>
                                <div className='flex flex-col justify-end mt-4 gap-2'>
                                    <Input
                                        name='gamepin'
                                        variant="default"
                                        placeholder='Enter Game Pin'
                                        value={gamePin}
                                        onChange={(e) => setGamePin(e.target.value)}
                                        maxLength={6}
                                        autoFocus
                                    />
                                    {error && <p className='text-red-500 text-center font-semibold bg-white/90 p-2 rounded'>{error}</p>}
                                    <Input
                                        name='nickname'
                                        variant="default"
                                        placeholder='Choose Nickname'
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        maxLength={20}
                                        autoFocus
                                    />
                                    <Button
                                        variant="active"
                                        size="xl"
                                        className='bg-[#FF00B7] text-white'
                                        onClick={() => handleNextStep()}
                                        disabled={!gamePin.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Join Game'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case JoinGameStep.LOBBYROOM:
                return (
                    <div className="flex flex-col gap-2 game-type-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center p-1 sm:p-3">
                        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col items-center gap-3'>
                            <Card className={'active:border-b-6 active:border-r-6 active:border-t-2 active:border-l-2 text-black p-6'}>
                                <CardHeader className='justify-center items-center px-10'>
                                    <UserIcon size={32} weight='bold' />
                                </CardHeader>
                            </Card>
                            <h3 className='text-white text-2xl font-bold text-center'>{nickname}</h3>
                        </div>

                        <div className='flex justify-around'>
                            <Card className='w-full max-w-md'>
                                <CardHeader className='text-center px-8'>
                                    <p className='text-2xl font-semibold mb-2 '>You're in! 🎉</p>
                                    <p className='text-lg font-semibold mb-2'>
                                        See your nickname on the host's screen?
                                    </p>
                                    <p className='text-lg font-semibold mb-2'>
                                        Waiting for game to start...
                                    </p>
                                    <div className='animate-pulse text-black/80 text-sm flex items-center justify-center gap-2'>
                                        <span>⏳</span>
                                        <span>Get ready!</span>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>

                        <p className='absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded'>
                            {isSocketConnected ? '🟢 Connected to game' : '🔴 Reconnecting...'}
                        </p>
                    </div>
                )
        }
    }

    return renderStep()
}

export default JoinGame