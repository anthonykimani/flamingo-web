'use client'

import { useState, useEffect, useCallback } from 'react'
import { MiniKit } from "@worldcoin/minikit-js"
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider"
import { apiOptions } from '@/shared/api.config'

export interface WorldAppState {
  isWorldApp: boolean
  isInstalled: boolean
  walletAddress: string | undefined
  username: string | undefined
  profilePictureUrl: string | undefined
  isAuthenticated: boolean
  isAuthenticating: boolean
  hasToken: boolean
  signInError: string | null
  signIn: () => Promise<boolean>
  error: string | null
}

export function useWorldApp(): WorldAppState {
  const { isInstalled } = useMiniKit()
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (): Promise<boolean> => {
    const addr = walletAddress
    if (!addr) return false

    setIsSigningIn(true)
    setSignInError(null)

    try {
      const nonceRes = await fetch(`${apiOptions.endpoints.gameService}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr }),
      })
      const nonceData = await nonceRes.json()
      if (!nonceData.data?.message) {
        setSignInError('Failed to get nonce')
        return false
      }

      const msgResult = await (MiniKit.commandsAsync as any).signMessage({ message: nonceData.data.message })
      if (msgResult.finalPayload.status !== 'success') {
        setSignInError('Signature rejected')
        return false
      }

      const verifyRes = await fetch(`${apiOptions.endpoints.gameService}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: addr,
          signature: msgResult.finalPayload.signature,
          message: nonceData.data.message,
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.data?.token) {
        setSignInError('Verification failed')
        return false
      }

      localStorage.setItem('token', verifyData.data.token)
      return true
    } catch {
      setSignInError('Authentication failed')
      return false
    } finally {
      setIsSigningIn(false)
    }
  }, [walletAddress])

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

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')

  return {
    isWorldApp: typeof window !== 'undefined' &&
      window.navigator?.userAgent?.includes('World') === true,
    isInstalled: isInstalled === true,
    walletAddress,
    username,
    profilePictureUrl,
    isAuthenticated,
    isAuthenticating: isAuthenticating || isSigningIn,
    hasToken,
    signInError,
    signIn,
    error,
  }
}
