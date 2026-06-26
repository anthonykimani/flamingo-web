'use client'

import { useState, useEffect, useCallback } from 'react'
import { MiniKit } from "@worldcoin/minikit-js"
import type { MiniKitWalletAuthOptions, WalletAuthResult } from "@worldcoin/minikit-js/commands"

export interface WorldAppState {
  isWorldApp: boolean
  isInstalled: boolean
  walletAddress: string | undefined
  username: string | undefined
  profilePictureUrl: string | undefined
  isAuthenticated: boolean
  isAuthenticating: boolean
  error: string | null
  authenticate: () => Promise<string | undefined>
}

export function useWorldApp(): WorldAppState {
  const [isInstalled, setIsInstalled] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const installed = MiniKit.isInstalled()
    setIsInstalled(installed)

    if (installed) {
      const address = MiniKit.user?.walletAddress
      const user = MiniKit.user?.username
      const pfp = MiniKit.user?.profilePictureUrl

      if (address) {
        setWalletAddress(address)
        setIsAuthenticated(true)
      }
      if (user) setUsername(user)
      if (pfp) setProfilePictureUrl(pfp)
    }
  }, [])

  const authenticate = useCallback(async () => {
    if (!isInstalled) {
      setError("Not in World App")
      return
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      const nonce = crypto.randomUUID().replace(/-/g, "")

      const input = {
        nonce,
        statement: "Sign in to Flamingo",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      } satisfies MiniKitWalletAuthOptions

      const result = await MiniKit.walletAuth(input)

      if (result.executedWith === "fallback") {
        setError("Authentication failed")
        return
      }

      const address = result.data.address
      setWalletAddress(address)
      setUsername(MiniKit.user?.username)
      setProfilePictureUrl(MiniKit.user?.profilePictureUrl)
      setIsAuthenticated(true)

      return address
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      setError(message)
    } finally {
      setIsAuthenticating(false)
    }
  }, [isInstalled])

  return {
    isWorldApp: typeof window !== 'undefined' &&
      window.navigator?.userAgent?.includes('World') === true,
    isInstalled,
    walletAddress,
    username,
    profilePictureUrl,
    isAuthenticated,
    isAuthenticating,
    error,
    authenticate,
  }
}
