'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const autoConnectAttempted = useRef(false)

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!isWorldApp) {
      console.log('[WorldApp] signIn skipped — not in World App')
      return false
    }

    console.log('[WorldApp] signIn started')

    setIsAuthenticating(true)
    setSignInError(null)
    setError(null)

    try {
      const nonceUrl = `${apiOptions.endpoints.gameService}/auth/nonce`
      console.log('[WorldApp] fetching nonce:', nonceUrl)

      const nonceRes = await fetch(nonceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      console.log('[WorldApp] nonce response status:', nonceRes.status)

      const nonceData = await nonceRes.json()
      console.log('[WorldApp] nonce response body:', JSON.stringify(nonceData))

      const { nonce } = nonceData.data ?? {}
      if (!nonce) {
        console.error('[WorldApp] no nonce in response')
        setSignInError('Failed to get nonce')
        setError('Failed to get nonce')
        return false
      }

      console.log('[WorldApp] nonce received, calling walletAuth...')
      const result = await MiniKit.walletAuth({
        nonce,
        statement: 'Sign in to Flamingo',
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      })
      console.log('[WorldApp] walletAuth executedWith:', result.executedWith)

      if (result.executedWith === 'fallback') {
        console.error('[WorldApp] walletAuth fell back (not native)')
        setSignInError('World App authentication unavailable')
        setError('World App authentication unavailable')
        return false
      }

      const { address: authAddress, message, signature } = result.data
      console.log('[WorldApp] walletAuth address:', authAddress)
      console.log('[WorldApp] walletAuth signature present:', !!signature, 'message present:', !!message)

      setWalletAddress(authAddress)
      setUsername(MiniKit.user?.username)
      setProfilePictureUrl(MiniKit.user?.profilePictureUrl)
      setIsAuthenticated(true)
      console.log('[WorldApp] MiniKit user:', JSON.stringify({ username: MiniKit.user?.username, walletAddress: MiniKit.user?.walletAddress }))

      const verifyUrl = `${apiOptions.endpoints.gameService}/auth/verify`
      console.log('[WorldApp] verifying at:', verifyUrl)
      const verifyRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nonce,
          payload: { address: authAddress, message, signature },
        }),
      })
      console.log('[WorldApp] verify response status:', verifyRes.status)

      const verifyData = await verifyRes.json()
      console.log('[WorldApp] verify response body:', JSON.stringify({ ...verifyData, data: verifyData.data?.token ? { token: '(present)' } : verifyData.data }))

      if (!verifyData.data?.token) {
        console.error('[WorldApp] verify returned no token')
        setSignInError('Verification failed')
        setError('Verification failed')
        return false
      }

      localStorage.setItem('token', verifyData.data.token)
      console.log('[WorldApp] signIn SUCCESS — token stored')
      return true
    } catch (err) {
      console.error('[WorldApp] signIn threw:', err)
      setSignInError('Authentication failed')
      setError('Authentication failed')
      return false
    } finally {
      console.log('[WorldApp] signIn finished (authenticating -> false)')
      setIsAuthenticating(false)
    }
  }, [isWorldApp])

  useEffect(() => {
    if (!isWorldApp) return

    const address = MiniKit.user?.walletAddress
    const user = MiniKit.user?.username
    const pfp = MiniKit.user?.profilePictureUrl

    console.log('[WorldApp] mount effect — isInstalled:', isWorldApp, 'user:', JSON.stringify({ address, user, pfp }))

    if (address) {
      setWalletAddress(address)
      setIsAuthenticated(true)
      console.log('[WorldApp] cached wallet address found, marked authenticated:', address)
    }
    if (user) setUsername(user)
    if (pfp) setProfilePictureUrl(pfp)
  }, [isWorldApp])

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')

  // Auto-connect: prompt the SIWE signature on load when inside World App
  // and not yet authenticated. Guarded to attempt once per mount so a
  // rejected signature doesn't re-prompt in a loop.
  useEffect(() => {
    console.log('[WorldApp] auto-connect check — isWorldApp:', isWorldApp, 'isAuthenticated:', isAuthenticated, 'isAuthenticating:', isAuthenticating, 'attempted:', autoConnectAttempted.current)
    if (isWorldApp && !isAuthenticated && !isAuthenticating && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true
      console.log('[WorldApp] triggering auto-connect signIn()')
      signIn()
    }
  }, [isWorldApp, isAuthenticated, isAuthenticating, signIn])

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
