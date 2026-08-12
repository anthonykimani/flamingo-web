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
  const isWorldApp = isInstalled === true
  const [walletAddress, setWalletAddress] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!isWorldApp) return false

    setIsAuthenticating(true)
    setSignInError(null)

    try {
      const address = MiniKit.user?.walletAddress
      if (!address) {
        setSignInError('No wallet address available')
        return false
      }

      const nonceRes = await fetch(`${apiOptions.endpoints.gameService}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })
      const nonceData = await nonceRes.json()
      const { nonce } = nonceData.data ?? {}
      if (!nonce) {
        setSignInError('Failed to get nonce')
        return false
      }

      const result = await MiniKit.walletAuth({
        nonce,
        statement: 'Sign in to Flamingo',
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      })

      if (result.executedWith === 'fallback') {
        setSignInError('World App authentication unavailable')
        return false
      }

      const { address: authAddress, message, signature } = result.data

      setWalletAddress(authAddress)
      setUsername(MiniKit.user?.username)
      setProfilePictureUrl(MiniKit.user?.profilePictureUrl)
      setIsAuthenticated(true)

      const verifyRes = await fetch(`${apiOptions.endpoints.gameService}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: authAddress,
          nonce,
          payload: { address: authAddress, message, signature },
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
      setIsAuthenticating(false)
    }
  }, [isWorldApp])

  useEffect(() => {
    if (!isWorldApp) return

    const address = MiniKit.user?.walletAddress
    const user = MiniKit.user?.username
    const pfp = MiniKit.user?.profilePictureUrl

    if (address) {
      setWalletAddress(address)
      setIsAuthenticated(true)
    }
    if (user) setUsername(user)
    if (pfp) setProfilePictureUrl(pfp)
  }, [isWorldApp])

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')

  return {
    isWorldApp,
    isInstalled: isWorldApp,
    walletAddress,
    username,
    profilePictureUrl,
    isAuthenticated,
    isAuthenticating,
    hasToken,
    signInError,
    signIn,
    error,
  }
}
