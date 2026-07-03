'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { RankingIcon, StrategyIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { GameMode } from '@/enums/game_mode'
import { useWorldApp } from '@/hooks/use-world-app'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface ChooseGameTypeProps {
    onGameTypeSelect: (gameMode: GameMode) => void;
}

const ChooseGameType = ({ onGameTypeSelect }: ChooseGameTypeProps) => {
    const router = useRouter()
    const { isInstalled, isAuthenticated, isAuthenticating } = useWorldApp()
    const { isConnected } = useAccount()
    const [showWalletModal, setShowWalletModal] = useState(false)

    const hasWallet = isInstalled ? isAuthenticated : isConnected

    const handleDegenPvP = () => {
        if (hasWallet) {
            onGameTypeSelect(GameMode.DEGEN_PVP)
        } else {
            setShowWalletModal(true)
        }
    }

    return (
        <div className="flex flex-col items-center h-full sm:h-1/2 relative">
            <div className="flex-1 flex flex-col justify-center items-center gap-6 w-full px-4">
                <h1 className="font-[Oi] text-white [-webkit-text-stroke:1.5px_black] sm:[-webkit-text-stroke:2px_black] text-3xl xsm:text-5xl sm:text-6xl text-center">
                    Choose Game Type
                </h1>
                <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-2xl">
                    <Button
                        onClick={() => onGameTypeSelect(GameMode.HANGOUTS)}
                        variant={"active"}
                        size={"gametype"}
                    >
                        <UsersThreeIcon size={32} />Hangouts
                    </Button>
                    <Button
                        showComingSoon
                        disabled
                        onClick={() => onGameTypeSelect(GameMode.TEAM_BUILDING)}
                        variant={"active"}
                        size={"gametype"}
                    >
                        <StrategyIcon size={32} />Team Building
                    </Button>
                    <Button
                        onClick={handleDegenPvP}
                        variant={"active"}
                        size={"gametype"}
                    >
                        <RankingIcon size={32} />Degen PvP
                    </Button>
                </div>
            </div>
            <div className="pb-6">
                <Button onClick={() => router.back()} variant={"active"} color={"gametype"} size={"xl"}>
                    Main Menu
                </Button>
            </div>

            <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>$WLD & USDC at Stake</DialogTitle>
                        <DialogDescription>
                            Degen PvP requires a wallet to pool winnings. Non-wallet players can play Hangouts instead.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                        <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                                <Button
                                    variant="active"
                                    size="xl"
                                    className="w-full"
                                    onClick={() => {
                                        if (isInstalled && !isAuthenticated && !isAuthenticating) {
                                            import('@worldcoin/minikit-js').then(({ MiniKit }) => {
                                                MiniKit.commandsAsync.walletAuth({
                                                    nonce: crypto.randomUUID().replace(/-/g, ""),
                                                    statement: "Sign in to Flamingo for Degen PvP",
                                                    expirationTime: new Date(Date.now() + 1000 * 60 * 60),
                                                })
                                            })
                                            setShowWalletModal(false)
                                        } else {
                                            openConnectModal?.()
                                            setShowWalletModal(false)
                                        }
                                    }}
                                >
                                    {isInstalled && !isAuthenticated ? 'Connect World ID' : 'Connect Wallet'}
                                </Button>
                            )}
                        </ConnectButton.Custom>
                        <Button
                            variant="outline"
                            size="xl"
                            onClick={() => {
                                setShowWalletModal(false)
                                router.push('/join')
                            }}
                        >
                            Browse Hangouts
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ChooseGameType
