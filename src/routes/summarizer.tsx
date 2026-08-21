import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  DISCLAIMER,
  Field,
  InputPanel,
  OutputPanel,
  TextArea,
} from "@/components/Workspace";
import { generateAssistantOutput } from "@/lib/assistant.functions";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summariser | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn long meeting notes or transcripts into a clear briefing with decisions, owner-tagged action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summariser | AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Turn long meeting notes or transcripts into a clear briefing with decisions, owner-tagged action items and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingNotesSummariser,
});

function MeetingNotesSummariser() {
  const generate = useServerFn(generateAssistantOutput);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAll = () => {
    setNotes("");
    setOutput("");
    setError(null);
  };

  const resetOutput = () => {
    setOutput("");
    setError(null);
  };

  const run = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generate({
        data: { tool: "summary", input: notes, options: {} },
      });
      setOutput(result.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 lg:grid lg:grid-cols-12">
        <InputPanel
          title="Summarise meeting notes"
          subtitle="Paste raw notes or a transcript — the AI will infer the meeting title and detail level."
          onGenerate={run}
          loading={loading}
          disabled={!notes.trim()}
          actionLabel="Summarise Notes"
          onReset={resetAll}
        >
          <Field label="Raw Notes / Transcript">
            <TextArea
              rows={14}
              value={notes}
              onChange={setNotes}
              placeholder="Paste the full transcript or your rough bullet notes from the meeting. The AI will detect the meeting title and choose a brief, balanced or thorough summary based on the content."
            />
          </Field>
        </InputPanel>

        <OutputPanel
          badge="Briefing v1.0"
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          onRegenerate={run}
          onReset={resetOutput}
          emptyHint="Your briefing appears here with SUMMARY, DECISIONS, ACTION ITEMS, DEADLINES and OPEN QUESTIONS — all editable before you circulate it."
          disclaimer={DISCLAIMER}
        />
      </div>
    </AppShell>
  );
}

