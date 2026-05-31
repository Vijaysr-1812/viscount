import { createClient } from "@/utils/supabase/server";
import { ObligationsClient } from "@/components/obligations/ObligationsClient";
import { redirect } from "next/navigation";
import { getUserOrg } from "@/utils/org";

export default async function ObligationsPage() {
  const supabase = await createClient();

  // 1. Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const orgId = await getUserOrg(supabase, user.id);
  if (!orgId) {
    return <div>Error loading organization workspace.</div>;
  }

  // 2. Fetch obligations with contract join and linked evidence
  const { data: obligations, error } = await supabase
    .from('obligations')
    .select(`
      *, 
      contracts(id, title),
      obligation_evidence_links(
        match_type,
        confidence_score,
        human_verified,
        evidence(id, file_name, file_url, ai_summary)
      )
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching obligations:", error);
  }

  // 3. Fetch contracts for filter options (with risk_scores)
  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, title, risk_scores(overall_score)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  // 4. Map obligations relations defensively to resolve TypeScript relation mismatches
  const mappedObligations = (obligations || []).map((ob: any) => ({
    id: ob.id,
    contract_id: ob.contract_id,
    org_id: ob.org_id,
    obligation_summary: ob.obligation_summary,
    clause_text: ob.clause_text || null,
    severity: ob.severity || null,
    status: ob.status || null,
    created_at: ob.created_at,
    contracts: Array.isArray(ob.contracts)
      ? ob.contracts[0] || null
      : ob.contracts || null,
    evidenceLinks: ob.obligation_evidence_links || []
  }));

  const mappedContracts = (contracts || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    risk_score: c.risk_scores && c.risk_scores.length > 0 ? c.risk_scores[0].overall_score : 0
  }));

  return (
    <ObligationsClient 
      initialObligations={mappedObligations}
      initialContracts={mappedContracts}
    />
  );
}
