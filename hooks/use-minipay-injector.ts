"use client";

import { useState, useCallback } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http
} from "viem";
import { celo, celoSepolia } from "viem/chains";
import posthog from "posthog-js";

export function useMiniPayInjector() {
  const [address, setAddress] = useState<string | null>(null);

  const setUserAddress = useCallback((addr: string | null) => {
    setAddress(addr);
    if (addr) posthog.identify(addr);
  }, []);

  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: celoSepolia,
      });

      const [addr] = await walletClient.getAddresses();
      setUserAddress(addr);
    }
  };

  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http(),
  });

  return {
    address,
    setUserAddress, 
    getUserAddress,
    publicClient,
  };
}
