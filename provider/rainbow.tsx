'use client'

import '@rainbow-me/rainbowkit/styles.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { celo, celoSepolia } from 'wagmi/chains'
import { injectedWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet, rainbowWallet],
    },
  ],
  {
    appName: 'Flamingo',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? '',
  }
)

export const config = createConfig({
  connectors,
  chains: [celo, celoSepolia],
  transports: {
    [celoSepolia.id]: http(),
    [celo.id]: http(),
  },
})

const queryClient = new QueryClient()

export function RainbowKitProviderContainer({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
