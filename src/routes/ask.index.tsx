import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ensureThread } from "@/lib/festival-chats";
export const Route = createFileRoute("/ask/")({
  head: () => ({ meta: [{ title: "Ask about Festival of Praise @20" }, { name: "description", content: "Ask festival questions about dates, directions and merchandise." }, { property: "og:title", content: "Ask about Festival of Praise @20" }, { property: "og:description", content: "Festival answers from official website information." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: StartChat,
});
function StartChat() {
  const navigate = useNavigate();
  useEffect(() => { const { thread } = ensureThread(); void navigate({ to: "/ask/$threadId", params: { threadId: thread.id }, replace: true }); }, [navigate]);
  return <p className="p-8">Opening festival questions…</p>;
}