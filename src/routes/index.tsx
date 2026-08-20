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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Email Architect | Sentinel AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Generate professional emails in any tone — formal, friendly or persuasive — then edit the AI draft before you send it.",
      },
      { property: "og:title", content: "Email Architect | Sentinel AI Workplace Assistant" },
      {
        property: "og:description",
        content:
          "Generate professional emails in any tone — formal, friendly or persuasive — then edit the AI draft before you send it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailArchitect,
});

const TONES = ["Professional", "Formal", "Friendly", "Persuasive", "Direct", "Apologetic"] as const;
const LENGTHS = ["Concise", "Standard", "Detailed"] as const;

function EmailArchitect() {
  const generate = useServerFn(generateAssistantOutput);
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<string>("Professional");
  const [length, setLength] = useState<string>("Standard");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generate({
        data: {
          tool: "email",
          input: context,
          options: { tone, length, recipient, sender },
        },
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
          title="Draft new response"
          subtitle="Specify the context and tone for your AI assistant."
          onGenerate={run}
          loading={loading}
          disabled={!context.trim()}
          actionLabel="Generate Draft"
        >
          <Field label="Prompt Context">
            <TextArea
              rows={9}
              value={context}
              onChange={setContext}
              placeholder="Paste the email you received, or describe what you want to say…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tone">
              <Select value={tone} onChange={setTone} options={TONES} />
            </Field>
            <Field label="Length">
              <Select value={length} onChange={setLength} options={LENGTHS} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Recipient">
              <TextInput value={recipient} onChange={setRecipient} placeholder="Julian Vane" />
            </Field>
            <Field label="Sign off as">
              <TextInput value={sender} onChange={setSender} placeholder="Sarah Chen" />
            </Field>
          </div>
        </InputPanel>

        <OutputPanel
          badge="Draft v1.0"
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          onRegenerate={run}
          emptyHint="Your generated email appears here and stays fully editable — adjust wording, then copy it into your mail client."
          disclaimer={DISCLAIMER}
        />
      </div>
    </AppShell>
  );
}
