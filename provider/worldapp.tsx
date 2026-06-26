'use client'

import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider"

export function WorldAppProvider({ children }: { children: React.ReactNode }) {
  return <MiniKitProvider>{children}</MiniKitProvider>
}
