'use client'

import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider"
import { config } from "@/provider/rainbow"

export function WorldAppProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID ?? ""

  return (
    <MiniKitProvider props={{ appId, wagmiConfig: config }}>
      {children}
    </MiniKitProvider>
  )
}
