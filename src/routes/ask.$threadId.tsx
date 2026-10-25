import { createFileRoute } from "@tanstack/react-router";
import { FestivalChat } from "@/components/FestivalChat";
export const Route = createFileRoute("/ask/$threadId")({
  head: () => ({ meta: [{ title: "Festival conversation — Festival of Praise @20" }, { name: "description", content: "Your festival questions and answers about Festival of Praise @20." }, { property: "og:title", content: "Festival conversation — Festival of Praise @20" }, { property: "og:description", content: "Ask about event details, merchandise and directions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
function Page() { const { threadId } = Route.useParams(); return <FestivalChat threadId={threadId} />; }