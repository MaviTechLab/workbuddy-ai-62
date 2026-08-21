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
  TextInput,
} from "@/components/Workspace";
import { generateAssistantOutput } from "@/lib/assistant.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Paste or describe an email and the assistant matches the right tone and length automatically, then lets you edit the draft before sending.",
      },
      {
        property: "og:title",
        content: "Smart Email Generator | AI Workplace Productivity Assistant",
      },
      {
        property: "og:description",
        content:
          "Paste or describe an email and the assistant matches the right tone and length automatically, then lets you edit the draft before sending.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmartEmailGenerator,
});

const PLACEHOLDER = `Paste the email you received, or describe what you want to say…

The assistant reads this box to decide:
• Tone — formal, friendly, persuasive, apologetic or direct, matched to the pasted email or to how you describe it.
• Email length — concise, standard or detailed, based on the depth of the context you provide.

You can also state it outright, e.g. "reply in a friendly tone, keep it concise".`;

function SmartEmailGenerator() {
  const generate = useServerFn(generateAssistantOutput);
  const [context, setContext] = useState("");
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
          options: { recipient, sender },
        },
      });
      setOutput(result.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetInputs = () => {
    setContext("");
    setRecipient("");
    setSender("");
    setError(null);
  };

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 lg:grid lg:grid-cols-12">
        <InputPanel
          title="Draft email response"
          subtitle="Paste or describe the email — tone and length are matched to your context automatically."
          onGenerate={run}
          onReset={resetInputs}
          loading={loading}
          disabled={!context.trim()}
          actionLabel="Generate Draft"
        >
          <Field label="Email Context">
            <TextArea rows={12} value={context} onChange={setContext} placeholder={PLACEHOLDER} />
          </Field>

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
          onReset={() => setOutput("")}
          emptyHint="Your generated email appears here and stays fully editable — adjust wording, then copy it into your mail client."
          disclaimer={DISCLAIMER}
        />
      </div>
    </AppShell>
  );
}
