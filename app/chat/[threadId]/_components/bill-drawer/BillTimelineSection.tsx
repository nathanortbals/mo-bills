import type { TimelineEvent } from '@/app/types/bill';
import CollapsibleSection from './CollapsibleSection';
import { formatDate } from './utils';

interface BillTimelineSectionProps {
  timeline: TimelineEvent[];
  chamber: 'house' | 'senate';
}

// Future steps based on chamber
const HOUSE_FUTURE_STEPS = [
  'Passed House',
  'Senate First Read',
  'Senate Committee',
  'Passed Senate',
  'Governor Action',
];

const SENATE_FUTURE_STEPS = [
  'Passed Senate',
  'House First Read',
  'House Committee',
  'Passed House',
  'Governor Action',
];

// Keywords to detect completed stages
const STAGE_KEYWORDS: Record<string, string[]> = {
  'Passed House': ['passed house', 'third read and passed'],
  'Passed Senate': ['passed senate'],
  'Senate First Read': ['read first time in senate', 'senate first read'],
  'House First Read': ['read first time in house', 'house first read'],
  'Governor Action': ['signed by governor', 'vetoed', 'became law'],
  'Senate Committee': ['referred to senate committee'],
  'House Committee': ['referred to house committee', 'referred to committee'],
};

function hasCompletedStage(timeline: TimelineEvent[], stage: string): boolean {
  const keywords = STAGE_KEYWORDS[stage] || [];
  return timeline.some((event) =>
    keywords.some((keyword) => event.title.toLowerCase().includes(keyword))
  );
}

function buildFullTimeline(
  timeline: TimelineEvent[],
  chamber: 'house' | 'senate'
): TimelineEvent[] {
  const futureSteps = chamber === 'house' ? HOUSE_FUTURE_STEPS : SENATE_FUTURE_STEPS;
  const fullTimeline: TimelineEvent[] = [...timeline];

  for (const step of futureSteps) {
    if (!hasCompletedStage(timeline, step)) {
      fullTimeline.push({
        id: `future-${step}`,
        type: 'future',
        status: 'future',
        date: null,
        title: step,
      });
    }
  }

  return fullTimeline;
}

// Timeline node component
function TimelineNode({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  const isCompleted = event.status === 'completed';
  const isScheduled = event.status === 'scheduled';
  const isFuture = event.status === 'future';

  return (
    <div className="relative flex gap-3">
      {/* Vertical line connector */}
      {!isLast && (
        <div
          className={`absolute left-2.25 top-5 h-full w-0.5 ${
            isFuture ? 'bg-neutral-700' : 'bg-blue-500/30'
          }`}
        />
      )}

      {/* Node circle */}
      <div className="relative z-10 mt-1 shrink-0">
        {isCompleted && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {isScheduled && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/20">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
        )}
        {isFuture && (
          <div className="h-5 w-5 rounded-full border-2 border-neutral-600 bg-neutral-800" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? '' : 'pb-4'} ${isFuture ? 'opacity-50' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                isFuture ? 'text-neutral-500' : 'text-neutral-200'
              }`}
            >
              {event.title}
            </p>
            {event.type === 'hearing' && event.committee && (
              <p className="mt-0.5 text-xs text-neutral-400">{event.committee}</p>
            )}
            {event.type === 'hearing' && (event.time || event.location) && (
              <p className="mt-0.5 text-xs text-neutral-500">
                {event.time}
                {event.time && event.location && ' · '}
                {event.location}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {event.date && (
              <span
                className={`text-xs ${
                  isScheduled
                    ? 'font-medium text-amber-400'
                    : isFuture
                      ? 'text-neutral-600'
                      : 'text-neutral-500'
                }`}
              >
                {formatDate(event.date)}
              </span>
            )}
            {isFuture && !event.date && (
              <span className="text-xs text-neutral-600">—</span>
            )}
          </div>
        </div>

        {/* Associated document */}
        {event.document && (
          <a
            href={event.document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1.5 rounded bg-neutral-800 px-2 py-1 text-xs text-blue-400 hover:bg-neutral-700 hover:text-blue-300 transition-colors"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            View {event.document.title}
          </a>
        )}
      </div>
    </div>
  );
}

export default function BillTimelineSection({ timeline, chamber }: BillTimelineSectionProps) {
  const fullTimeline = buildFullTimeline(timeline, chamber);

  return (
    <CollapsibleSection title="Legislative Progress">
      <div className="rounded-lg bg-neutral-900/50 px-4 pt-4">
        {fullTimeline.length > 0 ? (
          fullTimeline.map((event, index) => (
            <TimelineNode
              key={event.id}
              event={event}
              isLast={index === fullTimeline.length - 1}
            />
          ))
        ) : (
          <p className="text-sm text-neutral-500">No timeline events available</p>
        )}
      </div>
    </CollapsibleSection>
  );
}
