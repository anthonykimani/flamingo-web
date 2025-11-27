'use client'

import React, { type ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { optimism, base, lisk, celo } from '@reown/appkit/networks'
import { http } from 'viem'
import { cookieStorage, cookieToInitialState, createStorage, WagmiProvider, type Config } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const networks = [optimism, base, lisk, celo]
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

const queryClient = new QueryClient()
const ICON_URL = process.env.NEXT_PUBLIC_ICON_URL || `https://www.playflamingo.xyz/icon.ico?f2a83b8be18ff85a`
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!
if (!projectId) throw new Error('REOWN project id missing');

/** WagmiAdapter builds the wagmi config for us */
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks,

  transports: {
    [optimism.id]: http("https://mainnet.optimism.io"),
    [base.id]: http("https://mainnet.base.org"),
    [lisk.id]: http('https://rpc.api.lisk.com'),
  }

})

export const wagmiConfig = wagmiAdapter.wagmiConfig


createAppKit({
  projectId,
  adapters: [wagmiAdapter],
  networks: [optimism, base, lisk, celo],
  defaultNetwork: celo,
  metadata: {
    name: 'Flamingo',
    description: 'A real-time multiplayer quiz game similar to Kahoot',
    url: APP_URL,        
    icons: [ICON_URL],   
  },
  features: {
    analytics: true 
  },
  themeVariables: {
    "--w3m-accent": "#FFCB0C",
    "--w3m-border-radius-master": "1px",
    "--w3m-color-mix": "#000000",
  },
  enableWallets: true,
})

function AppKitContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppKitContextProvider



