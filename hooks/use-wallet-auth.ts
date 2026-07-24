'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiOptions } from '@/shared/api.config';

const TOKEN_KEY = 'token';

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authenticatingRef = useRef(false);

  const authenticate = useCallback(async () => {
    if (!address || !isConnected || authenticatingRef.current) return;
    authenticatingRef.current = true;
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const baseUrl = apiOptions.endpoints.gameService;

      const nonceRes = await fetch(`${baseUrl}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address.toLowerCase() }),
      });
      const nonceData = await nonceRes.json();
      const { message } = nonceData.data;

      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch(`${baseUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address.toLowerCase(), signature, message }),
      });
      const verifyData = await verifyRes.json();
      const newToken = verifyData.data.token;

      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
    } catch (err: any) {
      setAuthError(err?.message || 'Auth failed');
    } finally {
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
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (isConnected && address && !token && !authenticatingRef.current && !localStorage.getItem(TOKEN_KEY)) {
      authenticate();
    }
  }, [isConnected, address, authenticate]);

  return { token, isAuthenticated: !!token, isAuthenticating, authError, authenticate, clearToken };
}
