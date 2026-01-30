/**
 * Tool to get information about a legislator with fuzzy name matching.
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getSupabaseClient } from '@/database/client';

// Type for fuzzy search RPC result
interface FuzzyLegislatorResult {
  id: string;
  name: string;
  legislator_type: string | null;
  party_affiliation: string | null;
  year_elected: number | null;
  years_served: number | null;
  is_active: boolean;
  similarity_score: number;
}

// Type for session legislator with session info
interface SessionLegislatorWithSession {
  district: string;
  sessions: {
    year: number;
    session_code: string;
  } | null;
}

/**
 * Get information about a legislator
 */
export const getLegislatorInfo = tool(
  async ({ name }) => {
    const supabase = getSupabaseClient();

    // Use fuzzy search with pg_trgm for typo tolerance
    // Note: search_legislators_fuzzy is a custom RPC function not in auto-generated types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: fuzzyMatches, error } = await (supabase as any).rpc(
      'search_legislators_fuzzy',
      {
        search_name: name,
        similarity_threshold: 0.3,
        max_results: 10,
        active_only: false,
      }
    );

    if (error) {
      console.error('Fuzzy search error:', error);
      return `No legislator found matching '${name}'. Try searching with a different spelling or just the last name.`;
    }

    const legislators = fuzzyMatches && (fuzzyMatches as unknown[]).length > 0
      ? (fuzzyMatches as unknown as FuzzyLegislatorResult[])
      : [];

    if (legislators.length === 0) {
      return `No legislator found matching '${name}'. Try searching with a different spelling or just the last name.`;
    }

    // Get district info for all matching legislators (up to 5)
    const topMatches = legislators.slice(0, 5);
    const results: string[] = [];

    for (const leg of topMatches) {
      // Get current district from most recent session
      const { data: sessionLegData } = await supabase
        .from('session_legislators')
        .select(`
          district,
          sessions(year, session_code)
        `)
        .eq('legislator_id', leg.id)
        .order('sessions(year)', { ascending: false })
        .limit(1);

      const typedSessionLeg = sessionLegData as unknown as SessionLegislatorWithSession[];
      const currentDistrict = typedSessionLeg?.[0]?.district;
      const sessionInfo = typedSessionLeg?.[0]?.sessions;

      const districtStr = currentDistrict
        ? `District ${currentDistrict}${sessionInfo ? ` (${sessionInfo.year})` : ''}`
        : 'No district info';

      const result = `- ${leg.name} (ID: ${leg.id})
  ${leg.party_affiliation || 'Unknown party'} | ${districtStr} | ${leg.is_active ? 'Active' : 'Inactive'}
  Type: ${leg.legislator_type || 'N/A'} | Years Served: ${leg.years_served || 'N/A'}`;

      results.push(result);
    }

    const header = legislators.length === 1
      ? `Found 1 legislator matching '${name}':`
      : `Found ${legislators.length} legislators matching '${name}' (showing top ${topMatches.length}):`;

    return `${header}\n\n${results.join('\n\n')}`;
  },
  {
    name: 'get_legislator_info',
    description:
      'Get information about legislators matching a name. Returns up to 5 matches with party, district, and status. Use this when the user asks about a specific legislator or representative. Supports fuzzy matching for misspelled or partial names. Examples: "Who is Rep. Smith?", "Tell me about Jane Doe"',
    schema: z.object({
      name: z.string().describe('Legislator name (full or partial, typos tolerated)'),
    }),
  }
);
