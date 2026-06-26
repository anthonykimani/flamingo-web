'use client'

import { RainbowKitProviderContainer } from "@/provider/rainbow"
import { PostHogProvider } from "@/provider/posthog"
import { WorldAppProvider } from "@/provider/worldapp"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WorldAppProvider>
      <RainbowKitProviderContainer>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </RainbowKitProviderContainer>
    </WorldAppProvider>
  )
}
