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
    const { contractId, filePath } = await req.json();

    if (!contractId || !filePath) {
      return NextResponse.json({ error: "Missing contractId or filePath" }, { status: 400 });
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
      .from('contracts') // V2 bucket is 'contracts'
      .download(filePath);

    if (downloadError || !fileData) {
      // Fallback to V1 bucket if it's there
      const { data: v1FileData, error: v1DownloadError } = await supabase.storage
        .from('contract_documents')
        .download(filePath);
      
      if (v1DownloadError || !v1FileData) {
        console.error("Download Error:", downloadError || v1DownloadError);
        return NextResponse.json({ error: "Failed to download contract file" }, { status: 500 });
      }
      var finalFileData = v1FileData;
    } else {
      var finalFileData = fileData;
    }

    // 2. Parse the PDF text
    const buffer = Buffer.from(await finalFileData.arrayBuffer());
    
    let pdfText = "";
    let isMockText = false;
    try {
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const parsedPdf = await pdfParse(buffer);
      pdfText = parsedPdf.text;
    } catch (parseError: any) {
      console.warn("PDF Parse Error (might be non-PDF like DOCX):", parseError);
      const textAttempt = buffer.toString('utf-8');
      const isWordDoc = buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
      const hasNullBytes = textAttempt.includes('\u0000');
      
      if (!isWordDoc && !hasNullBytes && textAttempt.trim().length > 50) {
        pdfText = textAttempt;
      } else {
        pdfText = "[WORD DOCUMENT / NON-PDF INGESTION - FORENSIC SANDBOX FALLBACK TRIGGERED]";
        isMockText = true;
      }
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: "No text extracted from PDF" }, { status: 400 });
    }

    const truncatedText = pdfText.substring(0, 100000);

    const { data: contractData } = await supabase
      .from('contracts')
      .select('title')
      .eq('id', contractId)
      .eq('org_id', orgId)
      .single();

    // 3. Analyze with OpenAI
    let extraction;
    try {
      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert legal forensic AI. Analyze the following contract text. Extract the overall risk score, the contract type, and a list of all critical obligations and clauses.
Return ONLY a JSON object in this exact format:
{
  "risk_score": 65,
  "contract_type": "Master Service Agreement",
  "obligations": [
    {
      "clause_text": "Recipient shall maintain Confidential Information in strict confidence",
      "obligation_summary": "Maintain confidentiality",
      "severity": "medium",
      "status": "pending"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Contract Text:\n\n${truncatedText}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0].message.content;
      extraction = JSON.parse(responseContent || "{}");
    } catch (apiError: any) {
      console.warn("API call failed:", apiError.message);
      throw apiError;
    }

    // 4. Update the contract
    await supabase
      .from('contracts')
      .update({
        contract_type: extraction.contract_type,
        status: "ready",
        parsed_text: pdfText
      })
      .eq('id', contractId)
      .eq('org_id', orgId);

    // 5. Insert Risk Score
    await supabase
      .from('risk_scores')
      .insert({
        contract_id: contractId,
        org_id: orgId,
        overall_score: extraction.risk_score || 0,
        risk_level: extraction.risk_score > 65 ? "high" : "medium"
      });

    // 6. Insert obligations
    if (extraction.obligations && extraction.obligations.length > 0) {
      const obligationsToInsert = extraction.obligations.map((ob: any) => ({
        contract_id: contractId,
        org_id: orgId,
        clause_text: ob.clause_text,
        obligation_summary: ob.obligation_summary,
        severity: ob.severity?.toLowerCase() || 'medium',
        status: 'pending',
        extracted_by_model: "llama-3.3-70b-versatile"
      }));

      await supabase.from('obligations').insert(obligationsToInsert);
    }

    // 7. Log dynamic events to timeline_events
    try {
      await supabase
        .from('timeline_events')
        .insert([
          {
            contract_id: contractId,
            org_id: orgId,
            event_type: 'contract_uploaded',
            title: 'Contract Ingested',
            description: `Method: ${isMockText ? 'Sandbox Fallback' : 'Standard Ingestion'}`,
            severity: 'info'
          },
          {
            contract_id: contractId,
            org_id: orgId,
            event_type: 'obligation_extracted',
            title: 'AI Analysis Complete',
            description: `Extracted ${extraction.obligations?.length || 0} obligations`,
            severity: 'success'
          }
        ]);
    } catch (timelineError) {
      console.error("Error inserting timeline events:", timelineError);
    }

    return NextResponse.json({ success: true, extraction });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
