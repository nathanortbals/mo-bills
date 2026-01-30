'use client';

import { useEffect, useState } from 'react';
import type { LegislatorDetails } from '@/app/types/legislator';
import LoadingSpinner from '../LoadingSpinner';
import CollapsibleSection from '../CollapsibleSection';

interface LegislatorDrawerContentProps {
  legislatorId: string;
  onTitleChange?: (title: string) => void;
  onNavigate?: (state: { type: 'bill' | 'legislator' | 'document'; id: string }) => void;
}

export default function LegislatorDrawerContent({
  legislatorId,
  onTitleChange,
  onNavigate,
}: LegislatorDrawerContentProps) {
  const [legislator, setLegislator] = useState<LegislatorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLegislator() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/legislators/${legislatorId}`);
        if (!response.ok) {
          throw new Error('Failed to load legislator');
        }

        const data: LegislatorDetails = await response.json();
        setLegislator(data);

        // Set generic drawer title
        if (onTitleChange) {
          onTitleChange('Legislator');
        }
      } catch (err) {
        console.error('Error fetching legislator:', err);
        setError('Failed to load legislator details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLegislator();
  }, [legislatorId, onTitleChange]);

  if (isLoading) {
    return <LoadingSpinner message="Loading legislator details..." />;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/50 px-4 py-3 text-red-200">{error}</div>
    );
  }

  if (!legislator) return null;

  // Get current district from most recent session
  const currentDistrict = legislator.sessions.length > 0 ? legislator.sessions[0].district : null;

  return (
    <div className="space-y-6">
      {/* Header with photo and basic info */}
      <div className="flex gap-4">
        {legislator.picture_url ? (
          <img
            src={legislator.picture_url}
            alt={legislator.name}
            className="h-24 w-24 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-500">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">{legislator.name}</h3>

            {legislator.profile_url && (
              <a
                href={legislator.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View profile on house.gov
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {legislator.legislator_type && (
              <span className="inline-block rounded-full bg-blue-900/50 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                {legislator.legislator_type}
              </span>
            )}
            {legislator.party_affiliation && (
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  legislator.party_affiliation.toLowerCase().includes('republican')
                    ? 'bg-red-900/50 text-red-200'
                    : legislator.party_affiliation.toLowerCase().includes('democrat')
                    ? 'bg-blue-900/50 text-blue-200'
                    : 'bg-neutral-700 text-neutral-300'
                }`}
              >
                {legislator.party_affiliation}
              </span>
            )}
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                legislator.is_active
                  ? 'bg-emerald-900/50 text-emerald-200'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {legislator.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <CollapsibleSection title="Details">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {currentDistrict && (
            <div>
              <p className="text-neutral-500">Current District</p>
              <p className="text-neutral-200">{currentDistrict}</p>
            </div>
          )}
          {legislator.year_elected && (
            <div>
              <p className="text-neutral-500">Year Elected</p>
              <p className="text-neutral-200">{legislator.year_elected}</p>
            </div>
          )}
          {legislator.years_served !== null && (
            <div>
              <p className="text-neutral-500">Years Served</p>
              <p className="text-neutral-200">
                {legislator.years_served} year{legislator.years_served !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Sponsored Bills Section */}
      {legislator.sponsored_bills.length > 0 && (
        <CollapsibleSection title={`Sponsored Bills (${legislator.sessions[0]?.year || 'Current'})`}>
          <div className="space-y-2">
            {legislator.sponsored_bills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => onNavigate?.({ type: 'bill', id: bill.id })}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">{bill.bill_number}</span>
                    {bill.is_primary && (
                      <span className="text-xs text-emerald-400">Primary</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-2">{bill.title}</p>
                </div>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Sessions Section */}
      {legislator.sessions.length > 0 && (
        <CollapsibleSection title="Legislative Sessions">
          <div className="space-y-1">
            {legislator.sessions.map((session, index) => (
              <div
                key={`${session.year}-${session.session_code}-${index}`}
                className="text-sm py-1"
              >
                <span className="text-white">
                  {session.year}{' '}
                  {session.session_code === 'R'
                    ? 'Regular Session'
                    : `Special Session ${session.session_code}`}
                </span>
                <span className="text-neutral-500 ml-1">— District {session.district}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
