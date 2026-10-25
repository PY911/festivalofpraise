import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/festival-chat")({
  server: { handlers: { POST: async ({ request }) => {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "Please ask from the festival website." }, { status: 403 });
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return Response.json({ message: "Festival answers are not configured yet." }, { status: 401 });
    const { answerFestival } = await import("@/lib/ai/festival.server");
    return answerFestival(request, key);
  } } },
});