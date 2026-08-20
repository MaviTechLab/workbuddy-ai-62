import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { streamText, APICallError } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const AssistantInput = z.object({
  tool: z.enum(["email", "summary", "planner"]),
  input: z.string().min(1).max(20000),
  options: z.record(z.string()).default({}),
});

export type AssistantInput = z.infer<typeof AssistantInput>;

const SYSTEM: Record<AssistantInput["tool"], string> = {
  email:
    "You are a workplace communication assistant. Write complete, ready-to-send professional emails. " +
    "Always start with a 'Subject:' line, then the greeting, body paragraphs and a sign-off. " +
    "Never invent facts, figures, names or commitments that were not provided; use neutral placeholders like [Name] instead. " +
    "Return plain text only, no markdown fences or commentary.",
  summary:
    "You are a meeting notes analyst. Condense raw notes or transcripts into a clear briefing. " +
    "Return plain text with exactly these uppercase section headings on their own lines: SUMMARY, DECISIONS, ACTION ITEMS, DEADLINES, OPEN QUESTIONS. " +
    "Use '- ' bullets under each heading. Action items use the form '- [Owner] Task'. Deadlines use '- [Date] What is due'. " +
    "If a section has nothing in the source, write '- None identified'. Never invent owners or dates.",
  planner:
    "You are a task planning assistant. Turn a list of tasks and constraints into a realistic, time-blocked schedule. " +
    "Return plain text. For each day use a heading line like 'MONDAY' or 'TODAY', then time-blocked rows in the form " +
    "'- 09:00-10:30 | P1 | Task — why it is placed here'. Priorities are P1 (critical), P2 (important), P3 (nice to have). " +
    "Front-load deep work, group shallow tasks, include breaks, and end with a 'RISKS' section listing overload or conflicts.",
};

function buildPrompt(data: AssistantInput): string {
  const o = data.options;
  if (data.tool === "email") {
    return [
      `Tone: ${o['tone'] ?? "Professional"}`,
      `Length: ${o['length'] ?? "Standard"}`,
      o['recipient'] ? `Recipient: ${o['recipient']}` : null,
      o['sender'] ? `Sender / sign-off name: ${o['sender']}` : null,
      "",
      "Context and goal of the email:",
      data.input,
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (data.tool === "summary") {
    return [
      `Meeting title: ${o['title'] || "Untitled meeting"}`,
      `Detail level: ${o['detail'] ?? "Balanced"}`,
      "",
      "Raw notes / transcript:",
      data.input,
    ].join("\n");
  }
  return [
    `Plan horizon: ${o['horizon'] ?? "Daily"}`,
    `Working hours: ${o['hours'] || "09:00-17:00"}`,
    `Working style: ${o['style'] ?? "Balanced"}`,
    "",
    "Tasks, goals and constraints:",
    data.input,
  ].join("\n");
}

export const generateAssistantOutput = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AssistantInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("AI is not configured for this workspace yet.");
    }

    const gateway = createLovableAiGatewayProvider(apiKey);

    try {
      const result = streamText({
        model: gateway("google/gemini-3.7-flash"),
        system: SYSTEM[data.tool],
        prompt: buildPrompt(data),
      });
      const text = await result.text;
      return { text: text.trim() };
    } catch (error) {
      const status = APICallError.isInstance(error) ? error.statusCode : undefined;
      if (status === 429) {
        throw new Error("Too many requests right now. Please wait a moment and try again.");
      }
      if (status === 402) {
        throw new Error("AI credits are exhausted. Add credits to this workspace to keep generating.");
      }
      if (status === 403) {
        throw new Error("AI access is blocked by workspace policy. Contact the workspace admin.");
      }
      throw new Error(
        error instanceof Error ? error.message : "The AI service failed to respond. Please try again.",
      );
    }
  });
