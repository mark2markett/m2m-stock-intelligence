'use client';

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

export function usePullToRefresh<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { onRefresh, threshold = 60 }: UsePullToRefreshOptions
): PullToRefreshState {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
  });

  const startY = useRef(0);
  const pulling = useRef(false);

  const handleRefresh = useCallback(async () => {
    setState(s => ({ ...s, isRefreshing: true, isPulling: false, pullDistance: 0 }));
    try {
      await onRefresh();
    } finally {
      setState({ isPulling: false, pullDistance: 0, isRefreshing: false });
    }
  }, [onRefresh]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const delta = Math.max(0, e.touches[0].clientY - startY.current);
      if (delta > 0) {
        setState(s => ({ ...s, isPulling: true, pullDistance: Math.min(delta, 120) }));
      }
    };

    const onTouchEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      setState(s => {
        if (s.pullDistance >= threshold) {
          handleRefresh();
          return s;
        }
        return { ...s, isPulling: false, pullDistance: 0 };
      });
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, threshold, handleRefresh]);

  return state;
}
