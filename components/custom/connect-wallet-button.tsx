'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { UserIcon } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { useMiniPayInjector } from '@/hooks/use-minipay-injector'
import { useEffect } from 'react'

type ConnectWalletButtonInnerProps = {
  account?: { address?: string; displayName?: string; displayBalance?: string }
  chain?: { unsupported?: boolean }
  openChainModal: () => void
  openConnectModal: () => void
  authenticationStatus?: string
  mounted: boolean
  setUserAddress: (address: string) => void
}

function ConnectWalletButtonInner({
  account,
  chain,
  openChainModal,
  openConnectModal,
  authenticationStatus,
  mounted,
  setUserAddress,
}: ConnectWalletButtonInnerProps) {
  const ready = mounted && authenticationStatus !== 'loading'

  const connected =
    ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

  useEffect(() => {
    if (connected && account?.address) setUserAddress(account.address)
  }, [connected, account?.address, setUserAddress])

  return (
    <div
      {...(!ready && {
        'aria-hidden': true,
        style: {
          opacity: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        },
      })}
    >
      {/* NOT CONNECTED */}
      {!connected && (
        <button
          onClick={openConnectModal}
          className="flex cursor-pointer items-center rounded-lg border-2 border-r-[6px] border-b-[6px] border-slate-800 bg-white p-2 transition-all hover:bg-white/90 active:border-r-2 active:border-b-2"
        >
          <UserIcon size={28} weight="regular" color="black" />
          <span className="ml-2 font-semibold">Connect Wallet</span>
        </button>
      )}

      {/* WRONG NETWORK */}
      {connected && chain?.unsupported && (
        <button
          onClick={openChainModal}
          className="flex cursor-pointer items-center rounded-lg border-2 border-r-[6px] border-b-[6px] border-red-700 bg-red-500 p-3 text-white transition-all hover:bg-red-600 active:border-r-2 active:border-b-2"
        >
          <span className="font-semibold">Wrong Network</span>
        </button>
      )}

      {/* CONNECTED */}
      {connected && !chain?.unsupported && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-r-[6px] border-b-[6px] border-slate-800 bg-white p-2 transition-all hover:bg-white/90 active:border-r-2 active:border-b-2">
              <UserIcon size={32} weight="regular" color="black" />

              <p className="font-semibold">{account.displayName}</p>
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>View and manage your wallet details</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="font-mono text-sm">Address: {account.displayName}</p>

              {account.displayBalance && (
                <p className="mt-2 font-semibold">Balance: {account.displayBalance}</p>
              )}
            </div>

            <DialogFooter>{/* extra actions can go here */}</DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export const ConnectWalletButton = () => {
  const { setUserAddress } = useMiniPayInjector()

  return (
    <ConnectButton.Custom>
      {(props: any) => <ConnectWalletButtonInner {...props} setUserAddress={setUserAddress} />}
    </ConnectButton.Custom>
  )
}
