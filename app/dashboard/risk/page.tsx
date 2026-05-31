import { createClient } from "@/utils/supabase/server";
import { RiskClient } from "@/components/risk/RiskClient";
import { redirect } from "next/navigation";
import { getUserOrg } from "@/utils/org";

export default async function RiskAnalyticsPage() {
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

  // 2. Fetch all org contracts
  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, title, contract_type, status, created_at, risk_scores(overall_score)')
    .eq('org_id', orgId);

  // 3. Fetch all org obligations
  const { data: obligations } = await supabase
    .from('obligations')
    .select('id, contract_id, obligation_summary, clause_text, severity, status')
    .eq('org_id', orgId);

  // 4. Map Risk Scores properly
  const mappedContracts = (contracts || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    contract_type: c.contract_type || null,
    status: c.status || null,
    risk_score: c.risk_scores && c.risk_scores.length > 0 ? c.risk_scores[0].overall_score : 0,
    created_at: c.created_at
  }));

  const mappedObligations = (obligations || []).map((o: any) => ({
    id: o.id,
    contract_id: o.contract_id,
    obligation_summary: o.obligation_summary,
    clause_text: o.clause_text || null,
    severity: o.severity || null,
    status: o.status || null
  }));

  return (
    <RiskClient 
      contracts={mappedContracts}
      obligations={mappedObligations}
    />
  );
}
