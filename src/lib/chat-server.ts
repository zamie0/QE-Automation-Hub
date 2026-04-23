import { createServerFn } from "@tanstack/react-start";

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const SYSTEM_PROMPT = `You are the QE Automation Hub assistant — an in-app guide for QA engineers using a web platform that organizes test automation suites and RPA bots.

The product has these main areas:
- Dashboard: KPIs, pass-rate trend, recent activity.
- Projects: folder-style workspaces. Two project types — "Test Automation" (Playwright / Cypress / Selenium / Robot Framework / Python) and "RPA" (visual flow builder).
- Project workspace tabs: Overview, Test Cases, API Testing, Scripts (or RPA Builder), Mobile, Web & Suites, Execution, Results, Discussion, Settings.
- Runs: global execution log with filters and triggers (Manual / Scheduled / CI/CD).
- Schedule: cron-style scheduling for suites and bots.
- Settings: team roles (Admin / QE / Viewer), CI/CD integrations (Jenkins, GitHub Actions, GitLab CI), environment variables.

Guidelines:
- Be concise, friendly, and practical. Default to short answers (≤4 short paragraphs) with small bullet lists when helpful.
- Use Markdown: **bold** for UI labels, \`code\` for file names and identifiers, bullet lists for steps.
- When a user asks "how do I X", give numbered steps that match the actual UI tabs above.
- If a question is outside QE / testing / this product, answer briefly and steer back to QE topics.
- Never invent features that don't exist. If unsure, say so and suggest the closest existing tab.`;

type GeminiRole = "user" | "model";
type GeminiContent = {
  role: GeminiRole;
  parts: { text: string }[];
};

function toGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));
}

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid payload");
    const { messages } = data as { messages?: unknown };
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
    const cleaned: ChatMessage[] = messages
      .filter((m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        typeof (m as ChatMessage).role === "string" &&
        typeof (m as ChatMessage).content === "string",
      )
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-20); // cap context
    if (cleaned.length === 0) throw new Error("messages cannot be empty");
    return { messages: cleaned };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("AI assistant is not configured. Missing GEMINI_API_KEY.");

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: toGeminiContents(data.messages),
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 900,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("The assistant is rate-limited right now. Please try again in a moment.");
      if (res.status === 401 || res.status === 403) throw new Error("Gemini API key is invalid or unauthorized.");
      throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 220) || "unknown error"}`);
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const reply = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    if (!reply) throw new Error("Empty response from Gemini");
    return { reply };
  });
