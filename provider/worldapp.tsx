'use client'

import { useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider"

export function WorldAppProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID ?? ""

  useEffect(() => {
    if (!appId) return
    MiniKit.install(appId)
  }, [appId])

  return <MiniKitProvider props={{ appId }}>{children}</MiniKitProvider>
}
