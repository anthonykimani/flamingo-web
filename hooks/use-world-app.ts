'use client'

import { useState, useEffect } from 'react'
import { MiniKit } from "@worldcoin/minikit-js"
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider"

export interface WorldAppState {
  isWorldApp: boolean
  isInstalled: boolean
  walletAddress: string | undefined
  username: string | undefined
  profilePictureUrl: string | undefined
  isAuthenticated: boolean
  isAuthenticating: boolean
  error: string | null
}

export function useWorldApp(): WorldAppState {
  const { isInstalled } = useMiniKit()
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInstalled) return

    const address = MiniKit.user?.walletAddress
    const user = MiniKit.user?.username
    const pfp = MiniKit.user?.profilePictureUrl

    if (address) {
      setWalletAddress(address)
      setIsAuthenticated(true)
    }
    if (user) setUsername(user)
    if (pfp) setProfilePictureUrl(pfp)

    if (user && address) return

    const doAuth = async () => {
      setIsAuthenticating(true)
      setError(null)
      try {
        const nonce = crypto.randomUUID().replace(/-/g, "")
        const result = await MiniKit.commandsAsync.walletAuth({
          nonce,
          statement: "Sign in to Flamingo",
          expirationTime: new Date(Date.now() + 1000 * 60 * 60),
        })

        if (result.finalPayload.status === 'error') {
          setError('Authentication failed')
          return
        }

        setWalletAddress(result.finalPayload.address)
        setUsername(MiniKit.user?.username)
        setProfilePictureUrl(MiniKit.user?.profilePictureUrl)
        setIsAuthenticated(true)
      } catch {
        setError('World App authentication failed')
      } finally {
        setIsAuthenticating(false)
      }
    }

    doAuth()
  }, [isInstalled])

  return {
    isWorldApp: typeof window !== 'undefined' &&
      window.navigator?.userAgent?.includes('World') === true,
    isInstalled: isInstalled === true,
    walletAddress,
    username,
    profilePictureUrl,
    isAuthenticated,
    isAuthenticating,
    error,
  }
}
