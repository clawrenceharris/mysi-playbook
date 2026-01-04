export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { strategyId } = await req.json();
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Load card copy
  const { data: card, error } = await client
    .from("playbook_strategies")
    .select("id, steps, title")
    .eq("id", strategyId)
    .single();
  if (error)
    return NextResponse.json(
      { error: error.message + "This Error " },
      { status: 500 }
    );

  const sys = `These steps are apart of a teaching or facilitation strategy for college Supplmenetal Instruction leaders to use in their study sessions with other students. Edit one or more steps to include a creative twist to the original activity. Keep 3–6 concise steps. Return JSON: { "steps": string[] }`;
  const usr = `Title: ${card.title}\nCurrent steps:\n${card.steps
    .map((s: string, i: number) => `${i + 1}. ${s}`)
    .join("\n")}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: usr },
    ],
    response_format: { type: "json_object" },
  });
  console.log(resp.choices[0].message);
  const out = JSON.parse(resp.choices[0].message?.content ?? "{}") as {
    steps: string[];
  };
  const { error: up } = await client
    .from("playbook_strategies")
    .update({ steps: out.steps })
    .eq("id", strategyId);
  if (up)
    return NextResponse.json({ error: up.message + " Error" }, { status: 500 });

  return NextResponse.json({ ok: true, steps: out.steps });
}
