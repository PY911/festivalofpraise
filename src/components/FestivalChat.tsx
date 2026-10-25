import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, Plus, Trash2, Copy, Music2 } from "lucide-react";
import logo from "@/assets/bethlehem-logo.jpg";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse, MessageAction } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ensureThread, newThread, readThreads, saveThreads, type FestivalThread } from "@/lib/festival-chats";

export function FestivalChat({ threadId }: { threadId: string }) {
  const [threads, setThreads] = useState<FestivalThread[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    try { setThreads(ensureThread(threadId).threads); }
    catch { setStorageError("Your browser could not save this conversation."); setThreads([newThread(threadId)]); }
    setReady(true);
  }, [threadId]);
  const update = useCallback((messages: UIMessage[]) => {
    setThreads(current => {
      const text = messages.find(m => m.role === "user")?.parts.find(p => p.type === "text");
      const next = current.map(t => t.id === threadId ? { ...t, messages, updatedAt: Date.now(), title: text?.type === "text" ? text.text.slice(0, 45) : t.title } : t);
      try { saveThreads(next); } catch { setStorageError("Your browser could not save this conversation."); }
      return next;
    });
  }, [threadId]);
  const active = threads.find(t => t.id === threadId);
  function create() {
    const thread = newThread();
    const next = [thread, ...readThreads()];
    try { saveThreads(next); setThreads(next); void navigate({ to: "/ask/$threadId", params: { threadId: thread.id } }); }
    catch { setStorageError("Your browser could not save a new conversation."); }
  }
  function remove(id: string) {
    if (!window.confirm("Delete this conversation?")) return;
    const next = threads.filter(t => t.id !== id);
    const first = next[0] ?? newThread();
    const saved = next.length ? next : [first];
    try { saveThreads(saved); setThreads(saved); if (id === threadId) void navigate({ to: "/ask/$threadId", params: { threadId: first.id } }); }
    catch { setStorageError("Your browser could not delete this conversation."); }
  }
  return <div className="flex h-svh flex-col bg-background text-foreground">
    <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-6">
      <Button asChild variant="ghost" size="icon" title="Back to festival"><Link to="/" aria-label="Back to festival"><ArrowLeft /></Link></Button>
      <img src={logo} className="h-11 w-11 rounded-full" alt="Bethlehem Society" />
      <div className="min-w-0"><p className="text-sm font-bold text-royal">Festival of Praise @20</p><p className="text-xs text-muted-foreground">Festival questions · AI-powered</p></div>
    </header>
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b bg-secondary p-3 md:w-64 md:border-r md:border-b-0">
        <Button onClick={create} className="justify-start"><Plus />New conversation</Button>
        <nav aria-label="Conversations" className="mt-3 flex max-h-28 gap-1 overflow-auto md:max-h-none md:flex-1 md:flex-col">
          {threads.map(t => <div key={t.id} className="flex shrink-0 items-center md:shrink"><Button asChild variant={t.id === threadId ? "secondary" : "ghost"} className="min-w-0 flex-1 justify-start md:w-full"><Link to="/ask/$threadId" params={{ threadId: t.id }}><span className="max-w-40 truncate">{t.title}</span></Link></Button><Button variant="ghost" size="icon-sm" title="Delete conversation" aria-label={`Delete ${t.title}`} onClick={() => remove(t.id)}><Trash2 className="text-muted-foreground" /></Button></div>)}
        </nav>
      </aside>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {storageError && <p role="alert" className="px-5 py-2 text-sm text-destructive">{storageError}</p>}
        {ready && active ? <ChatWindow key={threadId} thread={active} onMessages={update} /> : <p className="p-8 text-muted-foreground">Opening conversation…</p>}
      </main>
    </div>
  </div>;
}

function ChatWindow({ thread, onMessages }: { thread: FestivalThread; onMessages: (messages: UIMessage[]) => void }) {
  const [input, setInput] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/festival-chat", body: { conversationId: thread.id } }));
  const { messages, sendMessage, status, stop, error, clearError } = useChat({ id: thread.id, messages: thread.messages, transport,
    onFinish: ({ messages: finished }) => { onMessages(finished); textarea.current?.focus(); },
    onError: () => textarea.current?.focus(),
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => { onMessages(messages); }, [messages, onMessages]);
  useEffect(() => { textarea.current?.focus(); }, [status]);
  useEffect(() => () => { void stop(); }, [stop]);
  function send(text: string) {
    if (!text.trim() || busy) return;
    clearError(); setInput(""); void sendMessage({ text: text.trim() }); textarea.current?.focus();
  }
  return <>
    <Conversation className="min-h-0 flex-1">
      <ConversationContent className="mx-auto w-full max-w-3xl px-5 py-8">
        {!messages.length && <div className="my-auto py-8 sm:py-16">
          <Music2 className="mb-5 h-8 w-8 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold leading-snug text-royal sm:text-3xl">Festival questions</h1>
          <p className="mt-3 text-muted-foreground">What would you like to know about Festival of Praise @20?</p>
          <div className="mt-7 flex flex-wrap gap-2">{["When and where is the festival?", "What time does it start?", "What merchandise is available?"].map(q => <Button key={q} variant="outline" onClick={() => send(q)} className="h-auto whitespace-normal py-3 text-left">{q}</Button>)}</div>
        </div>}
        {messages.map(message => <Message key={message.id} from={message.role}>
          {message.role === "assistant" && <p className="text-xs font-semibold text-primary">Festival assistant</p>}
          <MessageContent className={message.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}>
            {message.parts.map((part, i) => part.type === "text" ? <MessageResponse key={i}>{part.text}</MessageResponse> : part.type === "reasoning" ? <Reasoning key={i} defaultOpen={false} isStreaming={busy && message.id === messages.at(-1)?.id}><ReasoningTrigger /><ReasoningContent>{part.text}</ReasoningContent></Reasoning> : null)}
          </MessageContent>
          {message.role === "assistant" && message.parts.some(p => p.type === "text" && p.text) && <MessageAction tooltip="Copy answer" onClick={() => { void navigator.clipboard.writeText(message.parts.filter(p => p.type === "text").map(p => p.text).join("\n")); }}><Copy /></MessageAction>}
        </Message>)}
        {busy && !messages.at(-1)?.parts.some(p => p.type === "text" && messages.at(-1)?.role === "assistant" && p.text) && <div role="status"><Shimmer>Checking festival information…</Shimmer></div>}
      </ConversationContent><ConversationScrollButton />
    </Conversation>
    <div className="mx-auto w-full max-w-3xl shrink-0 px-5 pt-2 pb-5">
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{safeError(error.message)}</p>}
      <PromptInput onSubmit={({ text }) => send(text)}>
        <PromptInputTextarea ref={textarea} autoFocus aria-label="Your festival question" placeholder="Ask about the festival…" value={input} onChange={e => setInput(e.target.value)} className="min-h-20 max-h-40" />
        <PromptInputFooter className="justify-end"><PromptInputSubmit status={status === "error" ? "ready" : status} onStop={() => { void stop(); textarea.current?.focus(); }} disabled={!busy && !input.trim()} title={busy ? "Stop answer" : "Send question"} /></PromptInputFooter>
      </PromptInput>
    </div>
  </>;
}
function safeError(message: string) {
  try { const value = JSON.parse(message); return value.message ?? message; } catch { return message; }
}