// Legislator session information
export interface LegislatorSession {
  year: number;
  session_code: string;
  district: string;
}

// Sponsored bill summary
export interface SponsoredBill {
  id: string;
  bill_number: string;
  title: string;
  is_primary: boolean;
}

// Legislator details returned by the API
export interface LegislatorDetails {
  id: string;
  name: string;
  legislator_type: string | null;
  party_affiliation: string | null;
  year_elected: number | null;
  years_served: number | null;
  picture_url: string | null;
  profile_url: string | null;
  is_active: boolean;
  sessions: LegislatorSession[];
  sponsored_bills: SponsoredBill[];
}
