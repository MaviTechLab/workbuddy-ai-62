import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  DISCLAIMER,
  Field,
  InputPanel,
  OutputPanel,
  Select,
  TextArea,
  TextInput,
} from "@/components/Workspace";
import { generateAssistantOutput } from "@/lib/assistant.functions";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Minute Master | Meeting Notes Summarizer" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a short briefing with decisions, owner-tagged action items and deadlines you can edit.",
      },
      { property: "og:title", content: "Minute Master | Meeting Notes Summarizer" },
      {
        property: "og:description",
        content:
          "Turn long meeting notes into a short briefing with decisions, owner-tagged action items and deadlines you can edit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinuteMaster,
});

const DETAIL = ["Brief", "Balanced", "Thorough"] as const;

function MinuteMaster() {
  const generate = useServerFn(generateAssistantOutput);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState<string>("Balanced");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generate({
        data: { tool: "summary", input: notes, options: { title, detail } },
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
          title="Summarize meeting notes"
          subtitle="Paste raw notes or a transcript — get decisions, actions and deadlines."
          onGenerate={run}
          loading={loading}
          disabled={!notes.trim()}
          actionLabel="Summarize Notes"
        >
          <Field label="Raw Notes / Transcript">
            <TextArea
              rows={12}
              value={notes}
              onChange={setNotes}
              placeholder="Paste the full transcript or your rough bullet notes from the meeting…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Meeting Title">
              <TextInput value={title} onChange={setTitle} placeholder="Q3 planning sync" />
            </Field>
            <Field label="Detail Level">
              <Select value={detail} onChange={setDetail} options={DETAIL} />
            </Field>
          </div>
        </InputPanel>

        <OutputPanel
          badge="Briefing v1.0"
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          onRegenerate={run}
          emptyHint="Your briefing appears here with SUMMARY, DECISIONS, ACTION ITEMS, DEADLINES and OPEN QUESTIONS — all editable before you circulate it."
          disclaimer={DISCLAIMER}
        />
      </div>
    </AppShell>
  );
}
