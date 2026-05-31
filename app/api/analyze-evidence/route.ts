import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserOrg } from "@/utils/org";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { evidenceId, filePath } = await req.json();

    if (!evidenceId || !filePath) {
      return NextResponse.json({ error: "Missing evidenceId or filePath" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getUserOrg(supabase, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // 1. Download the PDF from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('evidence')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download Error:", downloadError);
      return NextResponse.json({ error: "Failed to download evidence file" }, { status: 500 });
    }

    // 2. Parse the PDF text
    const buffer = Buffer.from(await fileData.arrayBuffer());
    
    let pdfText = "";
    let isMockText = false;
    try {
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const parsedPdf = await pdfParse(buffer);
      pdfText = parsedPdf.text;
    } catch (parseError: any) {
      console.warn("PDF Parse Error:", parseError);
      const textAttempt = buffer.toString('utf-8');
      const isWordDoc = buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
      const hasNullBytes = textAttempt.includes('\u0000');
      
      if (!isWordDoc && !hasNullBytes && textAttempt.trim().length > 50) {
        pdfText = textAttempt;
      } else {
        pdfText = "[NON-TEXT EVIDENCE / FORENSIC SANDBOX FALLBACK TRIGGERED]";
        isMockText = true;
      }
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: "No text extracted from PDF" }, { status: 400 });
    }

    const truncatedText = pdfText.substring(0, 50000); // 50k chars should be plenty for evidence

    // 3. Fetch pending obligations for this org
    const { data: pendingObligations } = await supabase
      .from('obligations')
      .select('id, clause_text, obligation_summary')
      .eq('org_id', orgId)
      .in('status', ['pending', 'partially_met'])
      .order('created_at', { ascending: false })
      .limit(100);

    let matchingResults;
    let aiSummary = "Evidence document analyzed.";

    if (pendingObligations && pendingObligations.length > 0) {
      // Prepare obligations list for prompt
      const obList = pendingObligations.map(ob => `ID: ${ob.id}\nSummary: ${ob.obligation_summary}`).join("\n\n");

      try {
        const completion = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are an expert legal forensic AI. Analyze the uploaded evidence document text and determine which, if any, of the provided pending obligations it fulfills.
Return ONLY a JSON object in this exact format:
{
  "ai_summary": "A brief 1-2 sentence description of what the evidence contains",
  "matches": [
    {
      "obligation_id": "the UUID of the matching obligation",
      "match_type": "full",
      "confidence_score": 0.95,
      "ai_reasoning": "Why this evidence proves the obligation was met"
    }
  ]
}`
            },
            {
              role: "user",
              content: `Pending Obligations:\n${obList}\n\nEvidence Document Text:\n${truncatedText}`
            }
          ],
          response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0].message.content;
        matchingResults = JSON.parse(responseContent || "{}");
        if (matchingResults.ai_summary) {
          aiSummary = matchingResults.ai_summary;
        }
      } catch (apiError: any) {
        console.warn("API call failed:", apiError.message);
        throw apiError;
      }
    } else {
      matchingResults = { matches: [] };
    }

    // 4. Update Evidence Record
    await supabase
      .from('evidence')
      .update({
        extracted_text: pdfText,
        ai_summary: aiSummary,
        status: "ready"
      })
      .eq('id', evidenceId)
      .eq('org_id', orgId);

    // 5. Insert Matches & Update Obligations
    const matches = matchingResults?.matches || [];
    if (matches.length > 0) {
      const linksToInsert = [];
      const obsToVerify = [];

      for (const m of matches) {
        // Validate that the obligation_id is actually in our pending list (AI hallucination check)
        const isValidOb = pendingObligations?.some(ob => ob.id === m.obligation_id);
        if (isValidOb) {
          linksToInsert.push({
            obligation_id: m.obligation_id,
            evidence_id: evidenceId,
            match_type: m.match_type || 'full',
            confidence_score: m.confidence_score || 0.9,
            ai_reasoning: m.ai_reasoning || "Matched by AI",
            human_verified: false,
            reviewed_by: user.id
          });

          if (m.match_type === 'full') {
            obsToVerify.push(m.obligation_id);
          }
        }
      }

      if (linksToInsert.length > 0) {
        await supabase.from('obligation_evidence_links').insert(linksToInsert);
      }

      // Update matched obligations to verified
      for (const obId of obsToVerify) {
        await supabase.from('obligations')
          .update({ status: 'verified' })
          .eq('id', obId);
      }

      // Timeline events
      await supabase.from('timeline_events').insert([
        {
          org_id: orgId,
          event_type: 'evidence_uploaded',
          title: 'Evidence Ingested & Analyzed',
          description: `Extracted text and generated summary.`,
          severity: 'info',
          evidence_id: evidenceId
        },
        {
          org_id: orgId,
          event_type: 'match_found',
          title: 'Automated Mapping Complete',
          description: `Automatically mapped to ${linksToInsert.length} obligations.`,
          severity: 'success',
          evidence_id: evidenceId
        }
      ]);
      
      // Trigger risk calculation since obligations were updated
      try {
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host");
        await fetch(`${protocol}://${host}/api/calculate-risk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": req.headers.get("cookie") || ""
          },
          body: JSON.stringify({}) // Recalculate for all contracts to be safe
        });
      } catch (calcErr) {
        console.error("Failed to trigger calculate-risk:", calcErr);
      }
      
    } else {
      // Just log the upload if no matches
      await supabase.from('timeline_events').insert([
        {
          org_id: orgId,
          event_type: 'evidence_uploaded',
          title: 'Evidence Ingested',
          description: `No matching obligations found automatically.`,
          severity: 'warning',
          evidence_id: evidenceId
        }
      ]);
    }

    return NextResponse.json({ success: true, results: matchingResults });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
