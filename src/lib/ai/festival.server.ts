import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, validateUIMessages, type UIMessage } from "ai";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { festivalInstructions } from "@/lib/festival-knowledge";
import { createLovableAiGatewayRunIdFetch, withLovableAiGatewayRunIdHeader } from "./run-id.ts";

export async function answerFestival(request: Request, apiKey: string) {
  const json: unknown = await request.json().catch(() => null);
  if (!json || typeof json !== "object" || !("messages" in json) || !("conversationId" in json) || typeof json.conversationId !== "string" || json.conversationId.length > 100 || !Array.isArray(json.messages)) {
    return Response.json({ message: "Please send a valid festival question." }, { status: 400 });
  }
  // Reject oversized history rather than silently losing earlier context.
  if (JSON.stringify(json.messages).length > 100_000) return Response.json({ message: "This conversation is too long. Please start a new conversation." }, { status: 400 });
  let messages: UIMessage[];
  try {
    messages = await validateUIMessages({ messages: json.messages });
    if (!messages.length || messages.some(m => !["user", "assistant"].includes(m.role) || m.parts.some(p => !["text", "reasoning", "step-start"].includes(p.type)))) throw new Error("Invalid message");
  } catch { return Response.json({ message: "Please send a text question." }, { status: 400 }); }
  const { data: blocked, error: stateError } = await supabaseAdmin.from("festival_ai_service_state").select("status,message").eq("id", "festival-assistant").maybeSingle();
  if (stateError) return Response.json({ message: "Festival answers are temporarily unavailable." }, { status: 503 });
  if (blocked) return Response.json({ message: blocked.message }, { status: blocked.status });

  const gateway = createLovableAiGatewayRunIdFetch();
  let failure: { status: number; message: string } | undefined;
  let resolveHeaders: () => void = () => {};
  const headersReady = new Promise<void>(resolve => { resolveHeaders = resolve; });
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      try {
        const response = await gateway.fetch(input, init);
        if (!response.ok) {
          const body = await response.clone().json().catch(() => ({}));
          const message = body.message ?? body.error?.message ?? "Festival answers are temporarily unavailable.";
          failure = { status: response.status, message: String(message) };
          if (response.status === 402 || response.status === 403) {
            const { error } = await supabaseAdmin.from("festival_ai_service_state").upsert({ id: "festival-assistant", ...failure });
            if (error) console.error("Unable to persist AI paused state", error.code);
          }
        }
        return response;
      } finally { resolveHeaders(); }
    },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"), instructions: festivalInstructions(),
    // History lives in the browser and can't be trusted: forward only the caller's own
    // user-role text to the model, never caller-supplied assistant turns.
    messages: await convertToModelMessages(
      messages
        .filter(m => m.role === "user")
        .map(m => ({ ...m, parts: m.parts.filter(p => p.type === "text") }))
        .filter(m => m.parts.length > 0),
      { ignoreIncompleteToolCalls: true },
    ),
    abortSignal: request.signal, maxRetries: 0,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
  });
  const response = result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true,
    onError: error => error instanceof Error ? error.message : "Festival answers are temporarily unavailable.",
    // Browser persistence happens in useChat.onFinish, not in server storage.
    onFinish: () => {},
  });
  const wrapped = withLovableAiGatewayRunIdHeader(response, gateway, { "Cache-Control": "no-store" });
  await headersReady;
  if (failure) {
    void (await wrapped).body?.cancel();
    return Response.json({ message: failure.message }, { status: failure.status });
  }
  if (request.signal.aborted) return new Response(null, { status: 499 });
  return wrapped;
}