'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionSection({ title, icon, defaultOpen = false, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>(defaultOpen ? 'none' : '0px');

  useEffect(() => {
    if (isOpen) {
      const el = contentRef.current;
      if (el) {
        setMaxHeight(`${el.scrollHeight}px`);
        // After transition, allow dynamic content
        const timer = setTimeout(() => setMaxHeight('none'), 300);
        return () => clearTimeout(timer);
      }
    } else {
      // Force a reflow before collapsing
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
        requestAnimationFrame(() => setMaxHeight('0px'));
      }
    }
  }, [isOpen]);

  return (
    <div className="border border-[#1f2937] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] flex items-center justify-between px-4 py-3 bg-[#111827] text-left transition-colors hover:bg-[#1a2235]"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-[#E5E7EB] text-sm">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[#6B7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight }}
      >
        <div className="p-4 bg-[#111827]">{children}</div>
      </div>
    </div>
  );
}
