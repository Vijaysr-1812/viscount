import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserOrg } from "@/utils/org";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // 1. Find the most recent contract for this org
    const { data: contracts, error: contractErr } = await supabase
      .from('contracts')
      .select('id, title')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (contractErr || !contracts || contracts.length === 0) {
      return NextResponse.json({ error: "No contracts found" }, { status: 404 });
    }

    const contractId = contracts[0].id;
    const contractTitle = contracts[0].title;

    // 2. Fetch its obligations
    const { data: obligations, error: obsErr } = await supabase
      .from('obligations')
      .select('id, obligation_summary, status')
      .eq('contract_id', contractId)
      .eq('org_id', orgId);

    if (obsErr || !obligations || obligations.length === 0) {
      return NextResponse.json({ error: "No obligations found for contract" }, { status: 404 });
    }

    // 3. Create dummy evidence and links
    const evidenceToInsert = [];
    const linksToInsert = [];
    const updatedObligations = [];

    for (let i = 0; i < obligations.length; i++) {
      const ob = obligations[i];
      const obSummary = (ob.obligation_summary || "").toLowerCase();
      
      let source = "manual_upload";
      let title = "Verified compliant";
      
      if (obSummary.includes("encrypt") || obSummary.includes("strict confidence")) {
        source = "api_webhook";
        title = "AWS KMS Config - S3 Bucket Encryption Active";
      } else if (obSummary.includes("destroy") || obSummary.includes("return")) {
        source = "manual_upload";
        title = "Certificate of Destruction logged";
      } else if (obSummary.includes("publicity") || obSummary.includes("disclose")) {
        source = "email_forward";
        title = "Communication Logs Checked";
      } else {
        source = "manual_upload";
        title = "Standard operating procedure verified";
      }

      // Generate a new UUID for the evidence record
      const evidenceId = crypto.randomUUID();

      evidenceToInsert.push({
        id: evidenceId,
        org_id: orgId,
        contract_id: contractId,
        evidence_type: "pdf",
        file_url: "dummy_url.pdf",
        file_name: title + ".pdf",
        source: source,
        ai_summary: title,
        status: "ready",
        uploaded_by: user.id,
      });

      linksToInsert.push({
        obligation_id: ob.id,
        evidence_id: evidenceId,
        match_type: "full",
        confidence_score: 0.95,
        ai_reasoning: "Automatically seeded evidence perfectly matches obligation requirements.",
        human_verified: true,
        reviewed_by: user.id
      });

      updatedObligations.push({
        id: ob.id,
        status: "verified"
      });
    }

    // Insert evidence
    const { error: evInsertErr } = await supabase.from('evidence').insert(evidenceToInsert);
    if (evInsertErr) throw new Error("Evidence insert error: " + evInsertErr.message);

    // Insert links
    const { error: linksErr } = await supabase.from('obligation_evidence_links').insert(linksToInsert);
    if (linksErr) throw new Error("Links insert error: " + linksErr.message);

    // Update obligations status
    for (const ob of updatedObligations) {
      await supabase.from('obligations').update({ status: ob.status }).eq('id', ob.id);
    }
    
    // Insert timeline event
    await supabase.from('timeline_events').insert([{
      org_id: orgId,
      contract_id: contractId,
      event_type: 'evidence_uploaded',
      title: 'Evidence Automatically Seeded',
      description: `Seeded and linked ${evidenceToInsert.length} evidence records`,
      severity: 'success',
      actor_id: user.id,
      actor_type: 'user'
    }]);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${evidenceToInsert.length} dummy evidence records and links to the most recent contract '${contractTitle}'.` 
    });

  } catch (error: any) {
    console.error("Error creating mock evidence:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
