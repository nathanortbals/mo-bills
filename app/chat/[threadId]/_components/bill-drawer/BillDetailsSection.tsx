import type { BillDetails } from '@/app/types/bill';
import CollapsibleSection from '../CollapsibleSection';
import { formatDate } from './utils';

interface BillDetailsSectionProps {
  bill: BillDetails;
  submittedDate: string | null;
}

export default function BillDetailsSection({ bill, submittedDate }: BillDetailsSectionProps) {
  return (
    <CollapsibleSection title="Details">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {bill.lr_number && (
          <div>
            <p className="text-neutral-500">LR Number</p>
            <p className="text-neutral-200">{bill.lr_number}</p>
          </div>
        )}
        {submittedDate && (
          <div>
            <p className="text-neutral-500">Submitted On</p>
            <p className="text-neutral-200">{formatDate(submittedDate)}</p>
          </div>
        )}
        {bill.last_action && (
          <div className="col-span-2">
            <p className="text-neutral-500">Last Action</p>
            <p className="text-neutral-200">{bill.last_action}</p>
          </div>
        )}
        {bill.proposed_effective_date && (
          <div>
            <p className="text-neutral-500">Proposed Effective Date</p>
            <p className="text-neutral-200">{bill.proposed_effective_date}</p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
