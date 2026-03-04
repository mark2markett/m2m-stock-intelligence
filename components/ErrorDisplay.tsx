'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, Clock, Search, ServerCrash } from 'lucide-react';
import type { AppError } from '@/lib/types';

interface ErrorDisplayProps {
  error: AppError;
  onRetry: () => void;
  onRetryWithSymbol?: (symbol: string) => void;
}

export function ErrorDisplay({ error, onRetry, onRetryWithSymbol }: ErrorDisplayProps) {
  const [countdown, setCountdown] = useState(error.retryAfter ?? 0);

  useEffect(() => {
    if (error.type !== 'rate_limit' || !error.retryAfter) return;
    setCountdown(error.retryAfter);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [error.type, error.retryAfter]);

  return (
    <div className="max-w-2xl mx-auto bg-[#111827] border border-[#1f2937] rounded-xl p-6">
      {error.type === 'invalid_symbol' && (
        <div className="text-center">
          <Search className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#E5E7EB] mb-1">Symbol not found</h3>
          <p className="text-sm text-[#9CA3AF] mb-4">{error.message}</p>
          {error.suggestions && error.suggestions.length > 0 && (
            <div>
              <p className="text-xs text-[#6B7280] mb-2">Did you mean:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {error.suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => onRetryWithSymbol?.(s)}
                    className="min-h-[44px] px-4 py-2 bg-[#1f2937] hover:bg-[#374151] text-[#E5E7EB] rounded-lg text-sm font-medium transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error.type === 'rate_limit' && (
        <div className="text-center">
          <Clock className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#E5E7EB] mb-1">Too many requests</h3>
          <p className="text-sm text-[#9CA3AF] mb-4">{error.message}</p>
          {countdown > 0 ? (
            <div className="text-2xl font-mono text-[#00E59B] mb-2">{countdown}s</div>
          ) : (
            <button
              onClick={onRetry}
              className="min-h-[44px] bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Retry Now
            </button>
          )}
        </div>
      )}

      {error.type === 'offline' && (
        <div className="text-center">
          <WifiOff className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#E5E7EB] mb-1">No internet connection</h3>
          <p className="text-sm text-[#9CA3AF]">Check your connection and try again.</p>
        </div>
      )}

      {(error.type === 'timeout' || error.type === 'server_error' || error.type === 'unknown') && (
        <div className="text-center">
          {error.type === 'timeout' ? (
            <Clock className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
          ) : (
            <ServerCrash className="h-10 w-10 text-red-400 mx-auto mb-3" />
          )}
          <h3 className="text-lg font-semibold text-[#E5E7EB] mb-1">
            {error.type === 'timeout' ? 'Request timed out' : 'Something went wrong'}
          </h3>
          <p className="text-sm text-[#9CA3AF] mb-4">{error.message}</p>
          <button
            onClick={onRetry}
            className="min-h-[44px] bg-[#00E59B] hover:bg-[#00cc8a] text-[#0a0e17] px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
