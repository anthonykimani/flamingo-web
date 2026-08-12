'use client';

// Must be the first import: stubs indexedDB during SSR before WalletConnect loads.
import '@/utils/ssr-guard';

import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RainbowKitProvider,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { celo, celoSepolia, worldchain } from 'wagmi/chains';
import { injectedWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { worldApp } from '@worldcoin/minikit-js/wagmi';

const rainbowConnectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [injectedWallet, rainbowWallet],
        },
    ],
    {
        appName: 'Flamingo',
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
    }
);

export const config = createConfig({
    connectors: [worldApp(), ...rainbowConnectors],
    chains: [celo, celoSepolia, worldchain],
    transports: {
        [celoSepolia.id]: http(),
        [celo.id]: http(),
        [worldchain.id]: http(),
    },
});

const queryClient = new QueryClient();

export function RainbowKitProviderContainer({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
