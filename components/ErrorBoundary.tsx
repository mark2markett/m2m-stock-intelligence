'use client';

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#E5E7EB] mb-2">Something went wrong</h2>
        <p className="text-[#9CA3AF] text-sm mb-6">
          {(error as Error)?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="min-h-[44px] min-w-[44px] bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
}
