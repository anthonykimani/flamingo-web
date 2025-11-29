'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { UserIcon } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useMiniPayInjector } from '@/hooks/use-minipay-injector';
import { useEffect } from 'react';

export const ConnectWalletButton = () => {
  const { setUserAddress } = useMiniPayInjector()

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';


        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        useEffect(() => {
          if (connected && account?.address) {
            setUserAddress(account?.address)
          }

        },[ connected, account?.address, setUserAddress])

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none'
              }
            })}
          >
            {/* NOT CONNECTED */}
            {!connected && (
              <button
                onClick={openConnectModal}
                className="flex items-center rounded-lg border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2 bg-white hover:bg-white/90 transition-all cursor-pointer p-2"
              >
                <UserIcon size={28} weight="regular" color="black" />
                <span className="ml-2 font-semibold">Connect Wallet</span>
              </button>
            )}

            {/* WRONG NETWORK */}
            {connected && chain?.unsupported && (
              <button
                onClick={openChainModal}
                className="flex items-center rounded-lg border-2 border-red-700 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2 bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer p-3"
              >
                <span className="font-semibold">Wrong Network</span>
              </button>
            )}

            {/* CONNECTED */}
            {connected && !chain?.unsupported && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-lg border-2 border-slate-800 border-b-[6px] border-r-[6px] 
                    active:border-b-2 active:border-r-2 
                    bg-white hover:bg-white/90 transition-all cursor-pointer p-2"
                  >
                    <UserIcon size={32} weight="regular" color="black" />

                    <p className="font-semibold">
                      {account.displayName}
                    </p>
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>
                      View and manage your wallet details
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <p className="font-mono text-sm">
                      Address: {account.displayName}
                    </p>

                    {account.displayBalance && (
                      <p className="font-semibold mt-2">
                        Balance: {account.displayBalance}
                      </p>
                    )}
                  </div>

                  <DialogFooter>
                    {/* extra actions can go here */}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
