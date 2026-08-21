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
    "Infer the appropriate tone (formal, friendly, persuasive, apologetic or direct) from the pasted email or the described situation, " +
    "honouring any tone the user states explicitly. " +
    "Also infer the right email length — concise, standard or detailed — from the depth and complexity of the provided context. " +
    "Always start with a 'Subject:' line, then the greeting, body paragraphs and a sign-off. " +
    "Never invent facts, figures, names or commitments that were not provided; use neutral placeholders like [Name] instead. " +
    "Return plain text only, no markdown fences or commentary.",
  summary:
    "You are a meeting notes analyst. Condense raw notes or transcripts into a clear briefing. " +
    "Infer the meeting title from the content, and choose an appropriate detail level: brief, balanced or thorough. " +
    "Return plain text with the inferred title as a heading, then exactly these uppercase section headings on their own lines: " +
    "SUMMARY, DECISIONS, ACTION ITEMS, DEADLINES, OPEN QUESTIONS. " +
    "Use '- ' bullets under each heading. Action items use the form '- [Owner] Task'. Deadlines use '- [Date] What is due'. " +
    "If a section has nothing in the source, write '- None identified'. Never invent owners or dates.",
  planner:
    "You are a task planning assistant. Turn a list of tasks, goals and constraints into a realistic schedule without fixed clock-time blocks. " +
    "Infer whether the user needs a daily or weekly schedule from the content and time constraints provided. " +
    "Infer each task's priority as High, Moderate or Low based on urgency, deadlines, impact and dependencies stated in the input. " +
    "Return plain text. For each day use a heading line like 'TODAY' or 'MONDAY', then list tasks in the form " +
    "'- High | Task — brief reason for placement'. Priorities are High (critical), Moderate (important), Low (nice to have). " +
    "Order tasks so deep work comes first, shallow tasks are grouped, and breaks are included as plain items. " +
    "End with a 'RISKS' section listing overload or conflicts. Do not use clock times like 09:00-10:30.",
};

function buildPrompt(data: AssistantInput): string {
  const o = data.options;
  if (data.tool === "email") {
    return [
      o['tone'] ? `Tone: ${o['tone']}` : "Tone: infer from the context below",
      o['length'] ? `Length: ${o['length']}` : "Length: infer from the context below (concise, standard or detailed)",
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
    return ["Raw notes / transcript:", data.input].join("\n");
  }
  return ["Tasks, goals and constraints:", data.input].join("\n");
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
