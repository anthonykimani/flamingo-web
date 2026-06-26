'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MiniKit } from "@worldcoin/minikit-js"
import type { MiniKitWalletAuthOptions } from "@worldcoin/minikit-js/commands"

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
  const [isInstalled, setIsInstalled] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authAttempted = useRef(false)

  // Poll MiniKit.isInstalled() since it initializes async after MiniKitProvider mounts
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 20 // ~2s total

    const check = () => {
      if (MiniKit.isInstalled()) {
        setIsInstalled(true)
        const address = MiniKit.user?.walletAddress
        const user = MiniKit.user?.username
        const pfp = MiniKit.user?.profilePictureUrl

        if (address) {
          setWalletAddress(address)
          setIsAuthenticated(true)
        }
        if (user) setUsername(user)
        if (pfp) setProfilePictureUrl(pfp)
        return true
      }
      return false
    }

    // Check immediately
    if (check()) return

    // Poll with increasing intervals
    const intervals = [100, 200, 500, 500, 500]
    let idx = 0

    const poll = () => {
      if (idx >= intervals.length || check()) return
      setTimeout(poll, intervals[idx])
      idx++
    }

    const timer = setTimeout(poll, intervals[0])
    idx = 1

    return () => clearTimeout(timer)
  }, [])

  // Auto-authenticate via SIWE once installed, to get username/profile
  useEffect(() => {
    if (!isInstalled || authAttempted.current) return

    const autoAuth = async () => {
      if (MiniKit.user?.username && MiniKit.user?.walletAddress) {
        setUsername(MiniKit.user.username)
        setProfilePictureUrl(MiniKit.user.profilePictureUrl)
        setWalletAddress(MiniKit.user.walletAddress)
        setIsAuthenticated(true)
        return
      }

      authAttempted.current = true
      setIsAuthenticating(true)

      try {
        const nonce = crypto.randomUUID().replace(/-/g, "")
        const result = await MiniKit.walletAuth({
          nonce,
          statement: "Sign in to Flamingo",
          expirationTime: new Date(Date.now() + 1000 * 60 * 60),
        } satisfies MiniKitWalletAuthOptions)

        if (result.executedWith === "fallback") return

        setWalletAddress(result.data.address)
        setUsername(MiniKit.user?.username)
        setProfilePictureUrl(MiniKit.user?.profilePictureUrl)
        setIsAuthenticated(true)
      } catch {
        // Silent fail — user can still use walletAddress from init
      } finally {
        setIsAuthenticating(false)
      }
    }

    autoAuth()
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
  }
}
