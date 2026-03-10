
import { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, TrendingUp, FileText, Radar } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StockSearchForm } from '@/components/StockSearchForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { ToastProvider } from '@/components/Toast';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { AboutPanel } from '@/components/AboutPanel';
import { PDFGenerator } from '@/client/pdfGenerator';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import {
  hideSplashScreen,
  configureStatusBar,
  hapticSuccess,
  hapticWarning,
  registerAppListeners,
  registerKeyboardListeners,
} from '@/lib/capacitor';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem, AppError, OptionsData, OptimalTrade } from '@/lib/types';

const M2M_DISCLAIMER = "EDUCATIONAL ANALYSIS ONLY - This is a market observation for educational purposes. It is not a recommendation to buy or sell any security. Trading options involves significant risk of loss. This analysis reflects one possible interpretation of market data and should not be acted upon without your own independent research.";

const LOADING_STEP_DELAYS = [0, 1500, 3000, 7000];

export function StockAnalysisClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [currentStock, setCurrentStock] = useState<StockData | null>(null);
  const [currentIndicators, setCurrentIndicators] = useState<TechnicalIndicators | null>(null);
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([]);
  const [currentOptionsData, setCurrentOptionsData] = useState<OptionsData | undefined>(undefined);
  const [currentOptimalTrade, setCurrentOptimalTrade] = useState<OptimalTrade | undefined>(undefined);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<NavTab>('search');
  const [isPartialResult, setIsPartialResult] = useState(false);
  const [lastAnalyzedSymbol, setLastAnalyzedSymbol] = useState('');

  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();
  const mainRef = useRef<HTMLDivElement>(null);
  const loadingTimers = useRef<NodeJS.Timeout[]>([]);
  const searchParams = useSearchParams();

  const hasResults = !!(currentReport && currentStock && currentIndicators);

  const clearLoadingTimers = useCallback(() => {
    loadingTimers.current.forEach(clearTimeout);
    loadingTimers.current = [];
  }, []);

  const startLoadingSteps = useCallback(() => {
    clearLoadingTimers();
    setLoadingStep(0);
    LOADING_STEP_DELAYS.forEach((delay, index) => {
      if (index === 0) return;
      const timer = setTimeout(() => setLoadingStep(index), delay);
      loadingTimers.current.push(timer);
    });
  }, [clearLoadingTimers]);

  useEffect(() => {
    return clearLoadingTimers;
  }, [clearLoadingTimers]);

  // Capacitor native initialization
  useEffect(() => {
    hideSplashScreen();
    configureStatusBar();
    registerKeyboardListeners();
    registerAppListeners();
  }, []);

  // Drill-down from scanner: auto-analyze ?symbol= param
  const drillDownSymbol = searchParams.get('symbol');
  const drillDownTriggered = useRef(false);
  useEffect(() => {
    if (drillDownSymbol && !drillDownTriggered.current) {
      drillDownTriggered.current = true;
      // Small delay so component is mounted
      const timer = setTimeout(() => {
        handleAnalyze(drillDownSymbol.toUpperCase());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [drillDownSymbol]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = useCallback(async (symbol: string) => {
    if (!isOnline) {
      setError({ type: 'offline', message: 'No internet connection. Check your network and try again.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentReport(null);
    setCurrentStock(null);
    setCurrentIndicators(null);
    setCurrentNews([]);
    setCurrentOptionsData(undefined);
    setCurrentOptimalTrade(undefined);
    setIsPartialResult(false);
    setLastAnalyzedSymbol(symbol);
    startLoadingSteps();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 58000);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const appError: AppError = {
          type: data.type || 'unknown',
          message: data.error || `Analysis failed (${response.status})`,
          retryAfter: data.retryAfter,
          suggestions: data.suggestions,
        };
        setError(appError);
        return;
      }

      const data = await response.json();

      setCurrentReport(data.report);
      setCurrentStock(data.stockData);
      setCurrentIndicators(data.indicators);
      setCurrentNews(data.news);
      setCurrentOptionsData(data.optionsData);
      setCurrentOptimalTrade(data.optimalTrade);

      if (data.partial) {
        setIsPartialResult(true);
        toast.warning('AI analysis unavailable. Showing technical data only.');
        hapticWarning();
      } else {
        hapticSuccess();
      }

      if (isMobile) {
        setActiveTab('results');
      }
    } catch (err) {
      hapticWarning();
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError({ type: 'timeout', message: 'Request timed out. The server may be busy â try again.' });
      } else {
        setError({ type: 'unknown', message: err instanceof Error ? err.message : 'Unknown error occurred' });
      }
    } finally {
      clearTimeout(timeout);
      clearLoadingTimers();
      setIsLoading(false);
    }
  }, [isOnline, isMobile, startLoadingSteps, clearLoadingTimers]);

  const handleRetry = useCallback(() => {
    if (lastAnalyzedSymbol) {
      handleAnalyze(lastAnalyzedSymbol);
    }
  }, [lastAnalyzedSymbol, handleAnalyze]);

  const handleRetryWithSymbol = useCallback((symbol: string) => {
    handleAnalyze(symbol);
  }, [handleAnalyze]);

  const handleDownloadPDF = useCallback(async () => {
    if (!currentReport || !currentStock || !currentIndicators) return;

    try {
      const pdfBlob = await PDFGenerator.generateReport(
        currentReport,
        currentStock,
        currentIndicators,
        currentNews
      );

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStock.symbol}-m2m-analysis-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
      hapticSuccess();
    } catch {
      toast.error('Failed to generate PDF. Please try again.');
      hapticWarning();
    }
  }, [currentReport, currentStock, currentIndicators, currentNews]);

  const handleTabChange = useCallback((tab: NavTab) => {
    if (tab === 'pdf') {
      handleDownloadPDF();
      return;
    }
    if (tab === 'scanner') {
      window.location.href = '/scanner';
      return;
    }
    setActiveTab(tab);
  }, [handleDownloadPDF]);

  const handlePullToRefresh = useCallback(async () => {
    if (lastAnalyzedSymbol) {
      await handleAnalyze(lastAnalyzedSymbol);
    }
  }, [lastAnalyzedSymbol, handleAnalyze]);

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(mainRef, {
    onRefresh: handlePullToRefresh,
  });

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="h-dvh bg-[#0a0e17] flex flex-col">
        <ToastProvider />

        {/* Fixed header â safe area for notch/Dynamic Island */}
        <header className="flex-shrink-0 z-40 bg-[#111827] border-b border-[#1f2937] pt-safe">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <span className="text-[#00E59B] font-bold text-xl tracking-tight">M2M</span>
              <div className="h-5 w-px bg-[#1f2937]" />
              <span className="text-sm font-semibold text-[#E5E7EB]">Stock Intelligence</span>
            </div>
            <TrendingUp className="h-4 w-4 text-[#00E59B]" />
          </div>
        </header>

        {/* Scrollable content area */}
        <div ref={mainRef} className="flex-1 overflow-y-auto min-h-0">
          <PullToRefreshIndicator
            isPulling={isPulling}
            pullDistance={pullDistance}
            isRefreshing={isRefreshing}
          />

          <main className="px-4 py-4 pb-20">
            {activeTab === 'search' && (
              <div className="space-y-6">
                <StockSearchForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                <p className="text-xs text-[#6B7280] text-center leading-relaxed">
                  {M2M_DISCLAIMER}
                </p>
                {error && (
                  <ErrorDisplay
                    error={error}
                    onRetry={handleRetry}
                    onRetryWithSymbol={handleRetryWithSymbol}
                  />
                )}
                {isLoading && <LoadingSpinner currentStep={loadingStep} />}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-4">
                {hasResults && !isLoading ? (
                  <AnalysisResults
                    report={currentReport}
                    stockData={currentStock}
                    indicators={currentIndicators}
                    newsData={currentNews}
                    optionsData={currentOptionsData}
                    optimalTrade={currentOptimalTrade}
                    onDownloadPDF={handleDownloadPDF}
                    isMobile
                    isPartialResult={isPartialResult}
                  />
                ) : isLoading ? (
                  <LoadingSpinner currentStep={loadingStep} />
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-[#374151] mx-auto mb-3" />
                    <p className="text-[#6B7280]">No results yet. Search for a stock to begin.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && <AboutPanel />}
          </main>
        </div>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} hasResults={hasResults} />
      </div>
    );
  }

  // --- DESKTOP LAYOUT (unchanged structure) ---
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <ToastProvider />

      <header className="bg-[#111827] border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#00E59B] font-bold text-2xl tracking-tight">M2M</span>
                <div className="h-6 w-px bg-[#1f2937]"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#E5E7EB]">Stock Intelligence</h1>
                <p className="text-xs text-[#6B7280]">Educational Market Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/scanner"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#9CA3AF] hover:text-[#00E59B] transition-colors rounded-lg hover:bg-[#1f2937]"
              >
                <Radar className="h-4 w-4" />
                <span>S&P 500 Scanner</span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <TrendingUp className="h-4 w-4 text-[#00E59B]" />
                <span>Powered by AI & Real-Time Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8 px-4 md:px-0">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 md:p-4 bg-[#111827] rounded-2xl border-2 border-[#00E59B]/30 shadow-lg shadow-[#00E59B]/5">
                <span className="text-[#00E59B] font-bold text-3xl md:text-5xl tracking-tight">M2M</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-bold text-[#E5E7EB] mb-2">Stock Intelligence</h1>
                <h2 className="text-lg md:text-xl text-[#9CA3AF]">
                  Educational Market Analysis Platform
                </h2>
              </div>
            </div>
            <p className="text-base md:text-lg text-[#9CA3AF] max-w-3xl mx-auto">
              Explore technical analysis with AI-powered observations,
              multi-timeframe indicators, and detailed PDF reports for educational market research.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <StockSearchForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Disclaimer below search form */}
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-[#6B7280] text-center leading-relaxed px-4">
              {M2M_DISCLAIMER}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={handleRetry}
              onRetryWithSymbol={handleRetryWithSymbol}
            />
          )}

          {/* Results */}
          <div className="max-w-6xl mx-auto">
            {isLoading && <LoadingSpinner currentStep={loadingStep} />}

            {hasResults && !isLoading && (
              <>
                <div className="mb-6 bg-[#111827] border border-[#00E59B]/20 rounded-lg p-4">
                  <p className="text-xs text-[#00E59B]/80 text-center leading-relaxed">
                    {M2M_DISCLAIMER}
                  </p>
                </div>
                <AnalysisResults
                  report={currentReport}
                  stockData={currentStock}
                  indicators={currentIndicators}
                  newsData={currentNews}
                  optionsData={currentOptionsData}
                  optimalTrade={currentOptimalTrade}
                  onDownloadPDF={handleDownloadPDF}
                  isPartialResult={isPartialResult}
                />
              </>
            )}
          </div>

          {/* Features Overview */}
          {!currentReport && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
              <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] text-center">
                <BarChart3 className="h-10 w-10 text-[#00E59B] mx-auto mb-4" />
                <h3 className="font-semibold text-[#E5E7EB] mb-2">Technical Analysis</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Advanced technical indicators including RSI, MACD, Bollinger Bands, and more
                </p>
              </div>
              <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] text-center">
                <TrendingUp className="h-10 w-10 text-[#00E59B] mx-auto mb-4" />
                <h3 className="font-semibold text-[#E5E7EB] mb-2">Pattern Recognition</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Identify setup lifecycle stages and quality scoring for educational study
                </p>
              </div>
              <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] text-center">
                <FileText className="h-10 w-10 text-[#00E59B] mx-auto mb-4" />
                <h3 className="font-semibold text-[#E5E7EB] mb-2">PDF Reports</h3>
                <p className="text-[#9CA3AF] text-sm">
                  Detailed PDF reports with comprehensive analysis for market education
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
stylingDirectives
pl-s
pl-kos