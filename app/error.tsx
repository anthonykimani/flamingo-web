'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="game-pin-background h-screen w-screen bg-no-repeat bg-cover flex justify-center items-center p-4">
      <div className="bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] py-10 px-8 text-center max-w-md">
        <h2 className="text-2xl font-oldschool text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6">
          The game hit an unexpected error. You can try again — your session is safe.
        </p>
        <Button variant="active" size="xl" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
