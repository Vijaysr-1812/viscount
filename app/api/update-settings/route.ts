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

    const { model, sensitivity, riskWeight } = await req.json();

    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        settings: {
          ai_model: model,
          sensitivity: sensitivity,
          risk_weight: riskWeight
        }
      })
      .eq('id', orgId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
