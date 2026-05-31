import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserOrg } from "@/utils/org";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // Optional: filter by specific contract
    const body = await req.json().catch(() => ({}));
    const { contractId } = body;

    let query = supabase.from('contracts').select('id, title').eq('org_id', orgId);
    if (contractId) {
      query = query.eq('id', contractId);
    }

    const { data: contracts, error: contractsError } = await query;

    if (contractsError || !contracts) {
      return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
    }

    // Fetch all obligations and links for these contracts
    const contractIds = contracts.map(c => c.id);
    const { data: obligations } = await supabase
      .from('obligations')
      .select('id, contract_id, status, severity, due_date, obligation_evidence_links(confidence_score)')
      .in('contract_id', contractIds);

    const obs = obligations || [];

    const riskScoresToUpsert = [];

    for (const contract of contracts) {
      const contractObs = obs.filter(o => o.contract_id === contract.id);
      const totalObs = contractObs.length;

      if (totalObs === 0) continue;

      let pendingCount = 0;
      let overdueCount = 0;
      let lowConfCount = 0;
      let disputedCount = 0;

      for (const ob of contractObs) {
        if (ob.status === 'pending') pendingCount++;
        if (ob.status === 'disputed' || ob.status === 'breached') disputedCount++;
        if (ob.status === 'pending' && ob.due_date && new Date(ob.due_date) < new Date()) overdueCount++;
        
        // Low confidence if it has no verified evidence or links with low confidence
        if (ob.obligation_evidence_links && ob.obligation_evidence_links.length > 0) {
          const minConf = Math.min(...ob.obligation_evidence_links.map((l: any) => l.confidence_score || 0));
          if (minConf < 0.6) lowConfCount++;
        }
      }

      const risk = Math.min(100, Math.round(
        (pendingCount * 100 / totalObs) * 0.25 +
        (overdueCount * 100 / totalObs) * 0.35 +
        (lowConfCount * 100 / totalObs) * 0.25 +
        (disputedCount * 100 / totalObs) * 0.15
      ));

      let risk_level = "low";
      if (risk >= 35 && risk < 65) risk_level = "medium";
      if (risk >= 65 && risk < 85) risk_level = "high";
      if (risk >= 85) risk_level = "critical";

      // Check if a risk score already exists
      const { data: existing } = await supabase
        .from('risk_scores')
        .select('id')
        .eq('contract_id', contract.id)
        .maybeSingle();

      riskScoresToUpsert.push({
        id: existing?.id,
        contract_id: contract.id,
        org_id: orgId,
        overall_score: risk,
        risk_level: risk_level,
        missing_evidence_score: Math.round((pendingCount / totalObs) * 100),
        overdue_score: Math.round((overdueCount / totalObs) * 100),
        low_confidence_score: Math.round((lowConfCount / totalObs) * 100),
        dispute_score: Math.round((disputedCount / totalObs) * 100),
        calculated_at: new Date().toISOString()
      });
    }

    for (const score of riskScoresToUpsert) {
      if (score.id) {
        await supabase.from('risk_scores').update(score).eq('id', score.id);
      } else {
        await supabase.from('risk_scores').insert(score);
      }
    }

    return NextResponse.json({ success: true, count: riskScoresToUpsert.length });

  } catch (error: any) {
    console.error("Risk Calculation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
