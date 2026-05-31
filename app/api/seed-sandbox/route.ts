import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getUserOrg } from "@/utils/org";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    // 2. Clear any existing user data to ensure clean seeding for this org
    await supabase.from('contracts').delete().eq('org_id', orgId);
    // Casading deletes will handle risk_scores, obligations, timeline, and evidence links

    // 3. Seed Contracts
    const contractsToInsert = [
      {
        org_id: orgId,
        title: "Enterprise Master Services Agreement (MSA)",
        status: "ready",
        contract_type: "Master Service Agreement",
        file_url: "https://pdfobject.com/pdf/sample.pdf",
      },
      {
        org_id: orgId,
        title: "Global Software Licensing Addendum (DPA)",
        status: "ready",
        contract_type: "Data Processing Agreement",
        file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
      {
        org_id: orgId,
        title: "Non-Disclosure Agreement (NDA) - PiedPiper",
        status: "ready",
        contract_type: "Non-Disclosure Agreement",
        file_url: "https://pdfobject.com/pdf/sample.pdf",
      }
    ];

    const { data: insertedContracts, error: contractErr } = await supabase
      .from('contracts')
      .insert(contractsToInsert)
      .select();

    if (contractErr || !insertedContracts || insertedContracts.length === 0) {
      console.error("Contract seed error:", contractErr);
      return NextResponse.json({ error: "Failed to seed contracts" }, { status: 500 });
    }

    const msaId = insertedContracts[0].id;
    const dpaId = insertedContracts[1].id;
    const ndaId = insertedContracts[2].id;

    // 4. Seed Risk Scores
    const riskScoresToInsert = [
      { contract_id: msaId, org_id: orgId, overall_score: 78, risk_level: "high" },
      { contract_id: dpaId, org_id: orgId, overall_score: 42, risk_level: "medium" },
      { contract_id: ndaId, org_id: orgId, overall_score: 15, risk_level: "low" }
    ];
    await supabase.from('risk_scores').insert(riskScoresToInsert);

    // 5. Seed Obligations
    const obligationsToInsert = [
      // MSA Obligations
      {
        contract_id: msaId,
        org_id: orgId,
        obligation_summary: "Maintain 99.99% infrastructure uptime.",
        clause_text: "Service Availability SLA: Maintain 99.99% core infrastructure uptime during standard business hours.",
        severity: "high",
        status: "disputed",
      },
      {
        contract_id: msaId,
        org_id: orgId,
        obligation_summary: "Encrypt PII using AES-256.",
        clause_text: "Data Protection: Encrypt all personal identifiable information (PII) at rest and in transit using AES-256.",
        severity: "critical",
        status: "verified",
      },
      {
        contract_id: msaId,
        org_id: orgId,
        obligation_summary: "Perform third-party SOC2 compliance certification.",
        clause_text: "Annual Security Audit: Perform third-party SOC2 compliance certification by December 31st annually.",
        severity: "medium",
        status: "breached",
      },
      // DPA Obligations
      {
        contract_id: dpaId,
        org_id: orgId,
        obligation_summary: "Indemnify against third-party patent infringement claims.",
        clause_text: "IP Indemnification: Indemnify and hold licensee against third-party patent infringement claims.",
        severity: "medium",
        status: "verified",
      },
      {
        contract_id: dpaId,
        org_id: orgId,
        obligation_summary: "Grant rights to inspect system logs within 48 hours.",
        clause_text: "Audit Rights: Grant licensee rights to inspect system logs and backup policies with 48 hours notice.",
        severity: "low",
        status: "verified",
      },
      // NDA Obligations
      {
        contract_id: ndaId,
        org_id: orgId,
        obligation_summary: "Keep algorithms confidential for 5 years.",
        clause_text: "Confidentiality: Keep all trade secrets and algorithms confidential for a period of 5 years from termination.",
        severity: "medium",
        status: "verified",
      }
    ];

    const { data: insertedObligations, error: obligationErr } = await supabase
      .from('obligations')
      .insert(obligationsToInsert)
      .select();

    if (obligationErr || !insertedObligations || insertedObligations.length === 0) {
      console.error("Obligation seed error:", obligationErr);
      return NextResponse.json({ error: "Failed to seed obligations" }, { status: 500 });
    }

    const slaObId = insertedObligations[0].id;
    const dataObId = insertedObligations[1].id;

    // 6. Seed Evidence & Links
    const evidenceToInsert = [
      {
        id: crypto.randomUUID(),
        contract_id: msaId,
        org_id: orgId,
        source: "AWS KMS Console",
        ai_summary: "Encryption enabled: AES-256 (active)",
        file_name: "kms_config.pdf",
        status: "ready",
        uploaded_by: user.id
      },
      {
        id: crypto.randomUUID(),
        contract_id: msaId,
        org_id: orgId,
        source: "AWS CloudWatch Metric",
        ai_summary: "Uptime measured: 99.95% over trailing 30 days",
        file_name: "cloudwatch_report.pdf",
        status: "ready",
        uploaded_by: user.id
      }
    ];

    await supabase.from('evidence').insert(evidenceToInsert);

    // Insert Links
    await supabase.from('obligation_evidence_links').insert([
      {
        obligation_id: dataObId,
        evidence_id: evidenceToInsert[0].id,
        match_type: "manual",
        human_verified: true,
        reviewed_by: user.id
      },
      {
        obligation_id: slaObId,
        evidence_id: evidenceToInsert[1].id,
        match_type: "ai_suggested",
        human_verified: false
      }
    ]);

    // 7. Seed Timeline Events
    const timelineEventsToInsert = [
      {
        contract_id: msaId,
        org_id: orgId,
        title: "Contract Uploaded",
        description: "Enterprise MSA uploaded for forensic ingestion",
        event_type: "contract_uploaded",
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        contract_id: msaId,
        org_id: orgId,
        title: "AI Analysis Complete",
        description: "Extracted 3 critical compliance tracks",
        event_type: "obligation_extracted",
        occurred_at: new Date(Date.now() - 4.9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        contract_id: dpaId,
        org_id: orgId,
        title: "Contract Uploaded",
        description: "Global DPA uploaded for compliance auditing",
        event_type: "contract_uploaded",
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        contract_id: dpaId,
        org_id: orgId,
        title: "AI Analysis Complete",
        description: "Extracted 2 licensing obligations",
        event_type: "obligation_extracted",
        occurred_at: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        contract_id: ndaId,
        org_id: orgId,
        title: "Contract Uploaded",
        description: "Non-Disclosure Agreement signed and cataloged",
        event_type: "contract_uploaded",
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        contract_id: ndaId,
        org_id: orgId,
        title: "AI Analysis Complete",
        description: "Extracted confidentiality duration rules",
        event_type: "obligation_extracted",
        occurred_at: new Date(Date.now() - 0.9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { error: timeErr } = await supabase
      .from('timeline_events')
      .insert(timelineEventsToInsert);

    if (timeErr) {
      console.error("Timeline event seed error:", timeErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unhandled seed error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
