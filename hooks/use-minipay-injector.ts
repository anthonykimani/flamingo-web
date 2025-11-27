"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http
} from "viem";
import { celo } from "viem/chains";
import posthog from "posthog-js";

export function useMiniPayInjector() {
  const [address, setAddress] = useState<string | null>(null);
  const [walletClient, setWalletClient] = useState<any>(null);

  // instantiate once on mount
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const client = createWalletClient({
      transport: custom(window.ethereum),
      chain: celo,
    });
    setWalletClient(client);

    // grab the address
    client.getAddresses().then(([addr]) => setAddress(addr)).catch(console.error);
  }, []);

  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      let walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: celo,
      });

      let [address] = await walletClient.getAddresses();
      setAddress(address);
      posthog.identify(address)
    }
  };

  const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
  });


  return {
    address,
    getUserAddress
  };
}
