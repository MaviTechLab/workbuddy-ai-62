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

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Pulse Planner | AI Task Scheduler" },
      {
        name: "description",
        content:
          "Turn a messy task list into a prioritized, time-blocked daily or weekly schedule you can edit and copy.",
      },
      { property: "og:title", content: "Pulse Planner | AI Task Scheduler" },
      {
        property: "og:description",
        content:
          "Turn a messy task list into a prioritized, time-blocked daily or weekly schedule you can edit and copy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PulsePlanner,
});

const HORIZONS = ["Daily", "Weekly"] as const;
const STYLES = ["Balanced", "Deep work first", "Quick wins first", "Meeting heavy"] as const;

function PulsePlanner() {
  const generate = useServerFn(generateAssistantOutput);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<string>("Daily");
  const [hours, setHours] = useState("09:00-17:00");
  const [style, setStyle] = useState<string>("Balanced");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!tasks.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generate({
        data: { tool: "planner", input: tasks, options: { horizon, hours, style } },
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
          title="Build your schedule"
          subtitle="List your tasks and constraints — get a prioritized, time-blocked plan."
          onGenerate={run}
          loading={loading}
          disabled={!tasks.trim()}
          actionLabel="Generate Schedule"
        >
          <Field label="Tasks, Goals & Constraints">
            <TextArea
              rows={11}
              value={tasks}
              onChange={setTasks}
              placeholder={
                "One per line, e.g.\nFinish Q3 budget deck (due Thursday)\nInterview two candidates\n1:1 with Priya, 30 min\nReview vendor contract"
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Horizon">
              <Select value={horizon} onChange={setHorizon} options={HORIZONS} />
            </Field>
            <Field label="Working Hours">
              <TextInput value={hours} onChange={setHours} placeholder="09:00-17:00" />
            </Field>
          </div>

          <Field label="Working Style">
            <Select value={style} onChange={setStyle} options={STYLES} />
          </Field>
        </InputPanel>

        <OutputPanel
          badge="Schedule v1.0"
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          onRegenerate={run}
          emptyHint="Your time-blocked plan appears here with P1–P3 priorities and a risks section — tweak any block before you commit to it."
          disclaimer={DISCLAIMER}
        />
      </div>
    </AppShell>
  );
}
