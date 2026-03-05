import { Suspense } from 'react';
import { StockAnalysisClient } from '@/components/StockAnalysisClient';

export default function Home() {
  return (
    <Suspense>
      <StockAnalysisClient />
    </Suspense>
  );
}
