'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { apiOptions } from '@/shared/api.config';

const TOKEN_KEY = 'token';

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { isInstalled } = useMiniKit();
  const isWorldApp = isInstalled === true;
  const { signMessageAsync } = useSignMessage();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authenticatingRef = useRef(false);

  const authenticate = useCallback(async () => {
    if (!address || !isConnected || authenticatingRef.current) {
      console.log('[WalletAuth] authenticate skipped — address:', address, 'isConnected:', isConnected, 'inFlight:', authenticatingRef.current)
      return;
    }
    authenticatingRef.current = true;
    setIsAuthenticating(true);
    setAuthError(null);
    console.log('[WalletAuth] authenticate started — address:', address)
    try {
      const baseUrl = apiOptions.endpoints.gameService;

      console.log('[WalletAuth] fetching nonce:', `${baseUrl}/auth/nonce`)
      const nonceRes = await fetch(`${baseUrl}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address.toLowerCase() }),
      });
      console.log('[WalletAuth] nonce response status:', nonceRes.status)
      const nonceData = await nonceRes.json();
      console.log('[WalletAuth] nonce response body:', JSON.stringify(nonceData))
      const { message } = nonceData.data;
      if (!message) {
        console.error('[WalletAuth] no message in nonce response')
      }

      console.log('[WalletAuth] requesting signature via signMessageAsync...')
      const signature = await signMessageAsync({ message });
      console.log('[WalletAuth] signature received:', !!signature)

      console.log('[WalletAuth] verifying at:', `${baseUrl}/auth/verify`)
      const verifyRes = await fetch(`${baseUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address.toLowerCase(), signature, message }),
      });
      console.log('[WalletAuth] verify response status:', verifyRes.status)
      const verifyData = await verifyRes.json();
      console.log('[WalletAuth] verify response body:', JSON.stringify({ ...verifyData, data: verifyData.data?.token ? { token: '(present)' } : verifyData.data }))
      const newToken = verifyData.data.token;
      if (!newToken) {
        console.error('[WalletAuth] verify returned no token')
      }

      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      console.log('[WalletAuth] authenticate SUCCESS — token stored')
    } catch (err: any) {
      console.error('[WalletAuth] authenticate threw:', err)
      setAuthError(err?.message || 'Auth failed');
    } finally {
      console.log('[WalletAuth] authenticate finished')
      setIsAuthenticating(false);
      authenticatingRef.current = false;
    }
  }, [address, isConnected, signMessageAsync]);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    console.log('[WalletAuth] init — stored token present:', !!stored)
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    console.log('[WalletAuth] auto-auth check — isWorldApp:', isWorldApp, 'isConnected:', isConnected, 'address:', !!address, 'hasToken:', !!token)
    if (!isWorldApp && isConnected && address && !token && !authenticatingRef.current && !localStorage.getItem(TOKEN_KEY)) {
      console.log('[WalletAuth] triggering auto authenticate()')
      authenticate();
    }
  }, [isWorldApp, isConnected, address, authenticate]);

  return { token, isAuthenticated: !!token, isAuthenticating, authError, authenticate, clearToken };
}
