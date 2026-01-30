'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="-mx-6 border-t border-neutral-800 px-6 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-500">{title}</h4>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'mt-3 max-h-500 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
