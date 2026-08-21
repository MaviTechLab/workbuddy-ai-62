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

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn a list of tasks and goals into a prioritized daily or weekly schedule with automatically assigned priorities.",
      },
      { property: "og:title", content: "AI Task Planner | AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Turn a list of tasks and goals into a prioritized daily or weekly schedule with automatically assigned priorities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiTaskPlanner,
});

function AiTaskPlanner() {
  const generate = useServerFn(generateAssistantOutput);
  const [tasks, setTasks] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAll = () => {
    setTasks("");
    setOutput("");
    setError(null);
  };

  const resetOutput = () => {
    setOutput("");
    setError(null);
  };

  const run = async () => {
    if (!tasks.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generate({
        data: { tool: "planner", input: tasks, options: {} },
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
          subtitle="List your tasks and goals — the AI will infer daily or weekly scheduling and assign High, Moderate or Low priorities."
          onGenerate={run}
          loading={loading}
          disabled={!tasks.trim()}
          actionLabel="Generate Schedule"
          onReset={resetAll}
        >
          <Field label="Tasks, Goals & Constraints">
            <TextArea
              rows={14}
              value={tasks}
              onChange={setTasks}
              placeholder={
                "One per line, e.g.\nFinish Q3 budget deck (due Thursday)\nInterview two candidates\n1:1 with Priya, 30 min\nReview vendor contract\n\n- Tasks and goals written here are used to generate daily or weekly schedules.\n- Generate daily or weekly schedules based on what is written above.\n- Priorities are determined automatically as High, Moderate or Low based on what is written."
              }
            />
          </Field>
        </InputPanel>

        <OutputPanel
          badge="Schedule v1.0"
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          onRegenerate={run}
          onReset={resetOutput}
          emptyHint="Your schedule appears here as a prioritized plan — daily or weekly, with High/Moderate/Low priorities and a risks section."
          disclaimer={DISCLAIMER}
        />
      </div>
    </AppShell>
  );
}
