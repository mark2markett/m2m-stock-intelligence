'use client';

import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

export function PullToRefreshIndicator({ pullDistance, isRefreshing, isPulling }: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  const rotation = Math.min(pullDistance * 3, 360);

  return (
    <div
      className="flex justify-center overflow-hidden transition-all"
      style={{ height: isRefreshing ? 48 : Math.min(pullDistance, 60) }}
    >
      <RefreshCw
        className={`h-6 w-6 text-[#00E59B] mt-3 ${isRefreshing ? 'animate-spin' : ''}`}
        style={isRefreshing ? undefined : { transform: `rotate(${rotation}deg)` }}
      />
    </div>
  );
}
