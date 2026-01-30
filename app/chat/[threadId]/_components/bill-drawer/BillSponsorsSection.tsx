import Image from 'next/image';
import type { BillDetails } from '@/app/types/bill';
import CollapsibleSection from './CollapsibleSection';

type Sponsor = BillDetails['sponsors'][number];

interface BillSponsorsSectionProps {
  sponsors: Sponsor[];
}

export default function BillSponsorsSection({ sponsors }: BillSponsorsSectionProps) {
  if (sponsors.length === 0) return null;

  const primarySponsor = sponsors.find((s) => s.is_primary);
  const cosponsors = sponsors.filter((s) => !s.is_primary);

  return (
    <CollapsibleSection title="Sponsors">
      <div className="space-y-3">
        {/* Primary Sponsor */}
        {primarySponsor && (
          <div className="flex items-center gap-3">
            {primarySponsor.picture_url ? (
              <Image
                src={primarySponsor.picture_url}
                alt={primarySponsor.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover bg-neutral-800"
                unoptimized
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-500">
                <svg
                  className="h-6 w-6"
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
            <div>
              <p className="font-medium text-neutral-200">{primarySponsor.name}</p>
              <p className="text-sm text-neutral-500">
                {primarySponsor.district && `District ${primarySponsor.district}`}
                {primarySponsor.district && primarySponsor.party && ' · '}
                {primarySponsor.party}
              </p>
            </div>
          </div>
        )}

        {/* Cosponsors */}
        {cosponsors.length > 0 && (
          <div className="text-sm">
            <span className="text-neutral-500">Co-sponsors: </span>
            <span className="text-neutral-400">
              {cosponsors
                .map((s) => `${s.name}${s.party ? ` (${s.party})` : ''}`)
                .join(', ')}
            </span>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
