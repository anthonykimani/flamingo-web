'use client'

import { RainbowKitProviderContainer } from "@/provider/rainbow"
import { PostHogProvider } from "@/provider/posthog"
import { WorldAppProvider } from "@/provider/worldapp"
import { Toaster } from "@/components/ui/sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <RainbowKitProviderContainer>
        <WorldAppProvider>
          {children}
          <Toaster />
        </WorldAppProvider>
      </RainbowKitProviderContainer>
    </PostHogProvider>
  )
}
