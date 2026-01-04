export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { playbookId } = await req.json();

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: lesson, error: le } = await client
    .from("playbooks")
    .select("id, topic, mode")
    .eq("id", playbookId)
    .single();
  if (le) return NextResponse.json({ error: le.message }, { status: 500 });

  const { data: cards, error: ce } = await client
    .from("playbook_strategies")
    .select("id,title,phase,steps,phase")
    .eq("playbook_id", playbookId);
  if (ce) return NextResponse.json({ error: ce.message }, { status: 500 });

  const sys = `Adapt each card's steps for a fully virtual (Zoom) session.
Keep steps concise and actionable. Use breakout rooms, chat, polls if helpful.
Return JSON: { "cards": [ { "id": string, "steps": string[] } ] } (same ids).`;
  const usr = `Topic: ${lesson.topic}\nCards:\n${cards
    .map(
      (c) =>
        `(${c.phase}) ${c.title}\n${c.steps
          .map((s: string, i: number) => `${i + 1}. ${s}`)
          .join("\n")}`
    )
    .join("\n\n")}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: usr },
    ],
    response_format: { type: "json_object" },
  });

  const out = JSON.parse(resp.choices[0].message?.content ?? "{}") as {
    cards: { id: string; steps: string[] }[];
  };

  // batch update
  for (const c of out.cards) {
    await client
      .from("playbook_strategies")
      .update({ steps: c.steps })
      .eq("id", c.id);
  }
  await client
    .from("playbooks")
    .update({ mode: "virtual" })
    .eq("id", playbookId);

  return NextResponse.json({ ok: true });
}
