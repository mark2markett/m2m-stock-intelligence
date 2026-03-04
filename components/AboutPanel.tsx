'use client';

import { BarChart3, Database, Cpu, AlertTriangle } from 'lucide-react';

export function AboutPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#00E59B]/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-[#00E59B]" />
          </div>
          <div>
            <h3 className="font-bold text-[#E5E7EB]">M2M Stock Intelligence</h3>
            <p className="text-xs text-[#6B7280]">by Mark2Market</p>
          </div>
        </div>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          Educational market analysis platform combining real-time data, 15+ technical indicators,
          AI-powered pattern recognition, and the M2M 6-Factor Scorecard for structured market study.
        </p>
      </div>

      <div className="bg-[#111827] rounded-xl p-6 border border-[#1f2937]">
        <h4 className="font-semibold text-[#E5E7EB] mb-3">Data Sources</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Database className="h-4 w-4 text-[#00E59B]" />
            <div>
              <p className="text-sm text-[#E5E7EB]">Polygon.io</p>
              <p className="text-xs text-[#6B7280]">Real-time stock data, historical prices, news</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-[#00E59B]" />
            <div>
              <p className="text-sm text-[#E5E7EB]">OpenAI</p>
              <p className="text-xs text-[#6B7280]">AI-generated analysis and pattern interpretation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl p-6 border border-yellow-400/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-400 text-sm mb-1">Disclaimer</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              This is an educational analysis tool only. It is not a recommendation to buy or sell
              any security. Trading involves significant risk of loss. Always conduct your own
              independent research before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
