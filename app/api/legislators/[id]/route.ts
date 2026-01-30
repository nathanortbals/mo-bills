import { getSupabaseClient } from '@/database/client';
import type { LegislatorDetails, LegislatorSession, SponsoredBill } from '@/app/types/legislator';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: 'Legislator ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch legislator details
    const { data: legislator, error: legislatorError } = await supabase
      .from('legislators')
      .select(`
        id,
        name,
        legislator_type,
        party_affiliation,
        year_elected,
        years_served,
        picture_url,
        profile_url,
        is_active
      `)
      .eq('id', id)
      .single();

    if (legislatorError || !legislator) {
      return Response.json({ error: 'Legislator not found' }, { status: 404 });
    }

    // Fetch all sessions this legislator has been part of
    const { data: sessionData } = await supabase
      .from('session_legislators')
      .select(`
        district,
        sessions(year, session_code)
      `)
      .eq('legislator_id', id)
      .order('sessions(year)', { ascending: false });

    // Transform session data
    const sessions: LegislatorSession[] = (sessionData || [])
      .map((s: any) => ({
        year: s.sessions?.year,
        session_code: s.sessions?.session_code,
        district: s.district,
      }))
      .filter((s: any) => s.year && s.session_code);

    // Get the most recent session for fetching sponsored bills
    const currentSession = sessions.length > 0 ? sessions[0] : null;

    // Fetch sponsored bills for the current session
    let sponsored_bills: SponsoredBill[] = [];
    if (currentSession) {
      // First get the session_legislator id for the current session
      const { data: sessionLegislator } = await supabase
        .from('session_legislators')
        .select('id, sessions!inner(year, session_code)')
        .eq('legislator_id', id)
        .eq('sessions.year', currentSession.year)
        .eq('sessions.session_code', currentSession.session_code)
        .single();

      if (sessionLegislator) {
        // Fetch bills sponsored by this legislator in the current session
        const { data: sponsoredBillsData } = await supabase
          .from('bill_sponsors')
          .select(`
            is_primary,
            bills(id, bill_number, title)
          `)
          .eq('session_legislator_id', sessionLegislator.id)
          .order('is_primary', { ascending: false });

        sponsored_bills = (sponsoredBillsData || [])
          .map((s: any) => ({
            id: s.bills?.id,
            bill_number: s.bills?.bill_number,
            title: s.bills?.title,
            is_primary: s.is_primary,
          }))
          .filter((b: any) => b.id && b.bill_number);
      }
    }

    // Build response
    const response: LegislatorDetails = {
      id: legislator.id,
      name: legislator.name,
      legislator_type: legislator.legislator_type,
      party_affiliation: legislator.party_affiliation,
      year_elected: legislator.year_elected,
      years_served: legislator.years_served,
      picture_url: legislator.picture_url,
      profile_url: legislator.profile_url,
      is_active: legislator.is_active ?? false,
      sessions,
      sponsored_bills,
    };

    return Response.json(response);
  } catch (error) {
    console.error('[legislators] Error fetching legislator details:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
