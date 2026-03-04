'use client';

import React from 'react';
import { Search, TrendingUp, BarChart3, FileText, CheckCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  currentStep?: number;
}

const STEPS = [
  { label: 'Fetching market data', icon: Search },
  { label: 'Computing indicators', icon: TrendingUp },
  { label: 'AI analysis', icon: BarChart3 },
  { label: 'Finalizing report', icon: FileText },
];

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ currentStep = 0 }) => {
  const progress = Math.min(((currentStep + 1) / STEPS.length) * 100, 100);

  return (
    <div className="bg-[#111827] rounded-xl p-6 sm:p-8 border border-[#1f2937]">
      {/* Progress bar */}
      <div className="w-full bg-[#1f2937] rounded-full h-1.5 mb-6">
        <div
          className="bg-[#00E59B] h-1.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-lg font-semibold text-[#E5E7EB] text-center mb-6">Generating Analysis</h3>

      <div className="space-y-3 max-w-md mx-auto">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                isActive
                  ? 'bg-[#00E59B]/10 border-[#00E59B]/30'
                  : isCompleted
                  ? 'bg-[#00E59B]/5 border-[#00E59B]/10'
                  : 'bg-[#0a0e17]/50 border-[#1f2937]/50'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-[#00E59B] flex-shrink-0" />
              ) : (
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-[#00E59B] animate-pulse' : 'text-[#374151]'
                  }`}
                />
              )}
              <span
                className={`text-sm ${
                  isActive
                    ? 'text-[#E5E7EB] font-medium'
                    : isCompleted
                    ? 'text-[#00E59B]'
                    : isFuture
                    ? 'text-[#374151]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {step.label}
                {isActive && '...'}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6B7280] mt-6 text-center">Analysis typically takes 5-10 seconds</p>
    </div>
  );
};
