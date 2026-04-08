'use client';

import { Search, BarChart3, FileText, Info } from 'lucide-react';

export type NavTab = 'search' | 'results' | 'pdf' | 'about';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasResults: boolean;
}

const tabs: { id: NavTab; label: string; icon: typeof Search }[] = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'about', label: 'About', icon: Info },
];

export function BottomNav({ activeTab, onTabChange, hasResults }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-[#1f2937] sm:hidden z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const disabled = (id === 'results' || id === 'pdf') && !hasResults;
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => !disabled && onTabChange(id)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-2 transition-colors ${
                active ? 'text-[#00E59B]' : disabled ? 'text-[#374151]' : 'text-[#6B7280]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
