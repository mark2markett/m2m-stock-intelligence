'use client';

import React from 'react';
import {
  Target,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Crosshair,
  ArrowUpRight,
  ArrowDownRight,
  MinusCircle,
  Info,
  Layers,
  DollarSign,
  Activity,
  Eye,
} from 'lucide-react';
import type { OptimalTrade as OptimalTradeType } from '@/lib/types';

interface OptimalTradeProps {
  trade: OptimalTradeType;
  symbol: string;
}

export const OptimalTrade: React.FC<OptimalTradeProps> = ({ trade, symbol }) => {
  const DirectionIcon = trade.direction === 'bullish' ? ArrowUpRight :
    trade.direction === 'bearish' ? ArrowDownRight : MinusCircle;

  const directionColor = trade.direction === 'bullish' ? 'text-[#00E59B]' :
    trade.direction === 'bearish' ? 'text-red-400' : 'text-[#9CA3AF]';

  const borderColor = trade.hasSetup
    ? (trade.direction === 'bullish' ? 'border-[#00E59B]/40' : 'border-red-400/40')
    : 'border-[#374151]';

  const headerBg = trade.hasSetup
    ? (trade.direction === 'bullish' ? 'bg-[#00E59B]/5' : 'bg-red-400/5')
    : 'bg-[#1f2937]/50';

  // --- NO SETUP VIEW ---
  if (!trade.hasSetup) {
    return (
      <div className={`bg-[#111827] rounded-xl border-2 ${borderColor} overflow-hidden`}>
        {/* Header */}
        <div className={`${headerBg} px-4 sm:px-6 py-4 border-b border-[#1f2937]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#374151]">
                <Eye className="h-5 w-5 text-[#9CA3AF]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E5E7EB]">
                  Optimal Trade — {symbol}
                </h3>
                <p className="text-sm text-[#9CA3AF]">No Trade — Monitoring</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#374151] text-[#9CA3AF]">
              NO SETUP
            </span>
          </div>
        </div>

        {/* Reasoning */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
          <p className="text-[#9CA3AF] text-sm leading-relaxed">{trade.reasoning}</p>
        </div>

        {/* Conditions Needed */}
        {trade.conditionsNeeded && trade.conditionsNeeded.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
            <h4 className="text-sm font-semibold text-[#E5E7EB] mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Conditions Needed for a Quality Setup
            </h4>
            <div className="space-y-2">
              {trade.conditionsNeeded.map((condition, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-[#0a0e17] rounded-lg border border-[#1f2937]">
                  <span className="text-yellow-400 font-mono text-xs mt-0.5 min-w-[20px]">{i + 1}.</span>
                  <span className="text-[#9CA3AF] text-sm leading-relaxed">{condition}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Levels that would apply */}
        {(trade.entryZone || trade.stopLoss || trade.target1) && (
          <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
            <h4 className="text-sm font-semibold text-[#E5E7EB] mb-3 flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-[#6B7280]" />
              Levels to Watch (if conditions develop)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {trade.entryZone && (
                <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
                  <div className="text-xs text-[#6B7280] mb-1">Potential Entry Zone</div>
                  <div className="text-sm text-[#E5E7EB]">{trade.entryZone}</div>
                </div>
              )}
              {trade.stopLoss && (
                <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
                  <div className="text-xs text-[#6B7280] mb-1">Logical Stop Area</div>
                  <div className="text-sm text-[#E5E7EB]">{trade.stopLoss}</div>
                </div>
              )}
              {trade.target1 && (
                <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
                  <div className="text-xs text-[#6B7280] mb-1">Potential Target</div>
                  <div className="text-sm text-[#E5E7EB]">{trade.target1}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-4 sm:px-6 py-3 bg-[#0a0e17]">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#6B7280] leading-relaxed">
              {trade.educationalDisclaimer}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- HAS SETUP VIEW ---
  return (
    <div className={`bg-[#111827] rounded-xl border-2 ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`${headerBg} px-4 sm:px-6 py-4 border-b border-[#1f2937]`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${trade.direction === 'bullish' ? 'bg-[#00E59B]/10' : 'bg-red-400/10'}`}>
              <Target className={`h-5 w-5 ${directionColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#E5E7EB]">
                Optimal Trade — {symbol}
              </h3>
              <p className={`text-sm font-medium ${directionColor}`}>
                {trade.strategy}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              trade.vehicle === 'options'
                ? 'bg-purple-400/10 text-purple-400 border border-purple-400/30'
                : `${trade.direction === 'bullish' ? 'bg-[#00E59B]/10 text-[#00E59B] border border-[#00E59B]/30' : 'bg-red-400/10 text-red-400 border border-red-400/30'}`
            }`}>
              {trade.vehicle === 'options' ? 'OPTIONS' : 'STOCK'}
            </span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              trade.direction === 'bullish' ? 'bg-[#00E59B]/10 text-[#00E59B]' :
              trade.direction === 'bearish' ? 'bg-red-400/10 text-red-400' :
              'bg-[#374151] text-[#9CA3AF]'
            }`}>
              <DirectionIcon className="h-3 w-3" />
              {trade.direction.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
        <p className="text-[#9CA3AF] text-sm leading-relaxed">{trade.reasoning}</p>
      </div>

      {/* Trade Levels Grid */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
        <h4 className="text-sm font-semibold text-[#E5E7EB] mb-3 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#00E59B]" />
          Trade Levels
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
            <div className="text-xs text-[#6B7280] mb-1">Entry Zone</div>
            <div className="text-sm font-semibold text-[#E5E7EB]">{trade.entryZone}</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-red-400/20">
            <div className="text-xs text-red-400 mb-1">Stop Loss</div>
            <div className="text-sm font-semibold text-[#E5E7EB]">{trade.stopLoss}</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#00E59B]/20">
            <div className="text-xs text-[#00E59B] mb-1">Target 1</div>
            <div className="text-sm font-semibold text-[#E5E7EB]">{trade.target1}</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#00E59B]/20">
            <div className="text-xs text-[#00E59B] mb-1">Target 2</div>
            <div className="text-sm font-semibold text-[#E5E7EB]">{trade.target2}</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
            <div className="text-xs text-[#6B7280] mb-1">R/R Ratio</div>
            <div className="text-sm font-semibold text-[#E5E7EB]">{trade.riskRewardRatio}</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
            <div className="text-xs text-[#6B7280] mb-1">Time Horizon</div>
            <div className="text-sm font-semibold text-[#E5E7EB]">{trade.timeHorizon}</div>
          </div>
        </div>
      </div>

      {/* Options Legs (if applicable) */}
      {trade.vehicle === 'options' && trade.legs && trade.legs.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
          <h4 className="text-sm font-semibold text-[#E5E7EB] mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            Options Contract{trade.legs.length > 1 ? 's' : ''}
          </h4>
          <div className="space-y-2">
            {trade.legs.map((leg, i) => (
              <div key={i} className="bg-[#0a0e17] rounded-lg p-3 border border-purple-400/20">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      leg.action === 'buy'
                        ? 'bg-[#00E59B]/10 text-[#00E59B]'
                        : 'bg-red-400/10 text-red-400'
                    }`}>
                      {leg.action.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-[#E5E7EB]">
                      ${leg.strikePrice} {leg.contractType.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      exp {leg.expirationDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <span>Est. ${leg.estimatedPrice.toFixed(2)}</span>
                    <span>Delta: {leg.delta.toFixed(3)}</span>
                  </div>
                </div>
                <p className="text-xs text-[#9CA3AF]">{leg.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk / Reward / IV summary */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#1f2937]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-red-400">Max Risk</span>
            </div>
            <p className="text-sm text-[#E5E7EB]">{trade.maxRisk}</p>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-[#00E59B]" />
              <span className="text-xs text-[#00E59B]">Max Reward</span>
            </div>
            <p className="text-sm text-[#E5E7EB]">{trade.maxReward}</p>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1f2937]">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs text-purple-400">IV Environment</span>
            </div>
            <p className="text-sm text-[#E5E7EB]">{trade.ivEnvironment}</p>
          </div>
        </div>
      </div>

      {/* Position Sizing */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#1f2937]">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            <span className="text-blue-400 font-medium">Position Sizing: </span>
            {trade.positionSizing}
          </p>
        </div>
      </div>

      {/* Educational Disclaimer */}
      <div className="px-4 sm:px-6 py-3 bg-[#0a0e17]">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {trade.educationalDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
