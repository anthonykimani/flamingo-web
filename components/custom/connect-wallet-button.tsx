'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { UserIcon } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useMiniPayInjector } from '@/hooks/use-minipay-injector';
import { useEffect } from 'react';
import { Button } from '../ui/button';

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
            {!connected && (
              <Button
                variant="wallet"
                size="wallet"
                onClick={openConnectModal}
              >
                <span>Connect Wallet</span>
              </Button>
            )}

            {connected && chain?.unsupported && (
              <Button
                variant="walletDanger"
                size="walletLg"
                onClick={openChainModal}
              >
                <span>Wrong Network</span>
              </Button>
            )}

            {connected && !chain?.unsupported && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="wallet" size="wallet">
                    <UserIcon size={32} weight="regular" color="black" />
                    <p>{account.displayName}</p>
                  </Button>
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
                      <p className="font-oldschool mt-2">
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
