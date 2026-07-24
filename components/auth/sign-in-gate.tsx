'use client';

import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { useAccount } from 'wagmi';

export function SignInGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { isAuthenticated, isAuthenticating, authenticate } = useWalletAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (isAuthenticating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        <p className="text-stone-400 text-sm">Signing in with your wallet...</p>
      </div>
    );
  }

  if (!isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 px-4">
      <p className="text-stone-300 text-center text-sm">Sign with your wallet to create quizzes</p>
      <button
        onClick={authenticate}
        className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Sign In
      </button>
    </div>
  );
}
