'use client'

import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { GameControllerIcon, MagicWandIcon, UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useConnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { useMiniPayInjector } from '@/hooks/use-minipay-injector'

const StartScreen = () => {
  const router = useRouter()
  // const { connect, isSuccess, data, isPending } = useConnect();
  const { address, getUserAddress } = useMiniPayInjector()

  // const { ready, authenticated, user } = usePrivy();
  // const { wallets } = useWallets();
  // const { login } = useLogin();

  // Get the embedded wallet address
  // const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  // Handle button click
  const handleRoute = async (route: string) => {
    // if (!ready) {
    //   alert('Wallet is still initializing...')
    //   return
    // }


    if (address !== null) {
      router.push(route)
    } else {
      try {
        // login()

      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover">
      {address && (
        <div>
          <div className='flex items-start justify-start gap-2 animate-fadeIn cursor-pointer p-1 sm:p-3'>
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center rounded-lg border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2 bg-white hover:bg-white/90 transition-all cursor-pointer p-2">
                <UserIcon size={32} weight='regular' color='black' />
                <p className=''>{address as `0x${string}`}</p>
              </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>User Profile</DialogTitle>
                  <DialogDescription>
                    View and manage your profile settings
                  </DialogDescription>
                </DialogHeader>
                {/* Add your dialog content here */}
                <div className="py-4">
                  {/* Your profile content */}
                </div>
                <DialogFooter>
                  {/* Optional footer buttons */}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* <p className='text-lg text-white text-center font-bold truncate w-full flex flex-col items-start justify-center'>
              {embeddedWallet?.address}
            </p> */}
          </div>
        </div>

      )}
      <div className="h-full flex flex-col justify-center md:items-center p-1 sm:p-3">
        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
          Flamingo
        </h1>

        <div className="flex flex-col sm:flex-row justify-center mt-4 gap-2">
          <Button
            variant="active"
            size="xl"
            onClick={() => handleRoute("/create")}
            disabled={!!address}
          >
            {address ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <MagicWandIcon size={32} />
                Create a Game
              </>
            )}
          </Button>

          <Button variant="active" onClick={() => handleRoute('/join')} disabled={!!address}>
            <GameControllerIcon size={32} />
            Join a Game
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StartScreen