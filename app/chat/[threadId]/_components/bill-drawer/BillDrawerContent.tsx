'use client';

import { useEffect, useState } from 'react';
import type { BillDetails } from '@/app/types/bill';
import BillHeader from './BillHeader';
import BillDetailsSection from './BillDetailsSection';
import BillSponsorsSection from './BillSponsorsSection';
import BillTimelineSection from './BillTimelineSection';
import BillDocumentsSection from './BillDocumentsSection';

interface BillDrawerContentProps {
  billId: string;
  onTitleChange?: (title: string) => void;
}

export default function BillDrawerContent({ billId, onTitleChange }: BillDrawerContentProps) {
  const [bill, setBill] = useState<BillDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBill() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/bills/${billId}`);
        if (!response.ok) {
          throw new Error('Bill not found');
        }
        const data = await response.json();
        setBill(data);
        onTitleChange?.(data.bill_number);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bill');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBill();
  }, [billId, onTitleChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-neutral-500">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading bill details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/50 px-4 py-3 text-red-200">{error}</div>
    );
  }

  if (!bill) return null;

  // Get submitted date (first action date)
  const submittedDate = bill.timeline.find((e) => e.type === 'action')?.date || null;

  return (
    <div className="space-y-6">
      <BillHeader bill={bill} />
      <BillDetailsSection bill={bill} submittedDate={submittedDate} />
      <BillSponsorsSection sponsors={bill.sponsors} />
      <BillTimelineSection timeline={bill.timeline} chamber={bill.chamber} />
      <BillDocumentsSection documents={bill.documents} />
    </div>
  );
}
