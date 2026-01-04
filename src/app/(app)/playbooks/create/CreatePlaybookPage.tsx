"use client";
import React from "react";
import { GeneratePlaybookForm } from "@/components/features/playbooks";
import { GeneratePlaybookInput } from "@/features/playbooks/domain";

export default function CreatePlaybookPage() {
  async function generatePlaybook(data: GeneratePlaybookInput) {
    const { topic, virtual, course_name, contexts } = data;
    const r = await fetch("/api/lessons/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contexts, topic, virtual, course_name }),
    });
    return await r.json();
  }

  return (
    <>
      <header className="header">
        <h1>Tell Us About Your Lesson</h1>
      </header>
      <div className="container">
        <GeneratePlaybookForm onSubmit={generatePlaybook} />
      </div>
    </>
  );
}
