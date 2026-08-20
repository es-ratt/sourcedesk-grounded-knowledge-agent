import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, BookOpen, CheckCircle2, Clock3, FileText, PanelRight, Search, ShieldCheck, Sparkles } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

type Passage = { id: string; heading: string; text: string; score: number; matchedTerms: string[] };
type Turn = { id: number; question: string; answer: string; passages: Passage[] };

const starterPrompts = [
  "How does SourceDesk keep answers grounded?",
  "What does a successful run include?",
  "What are the MVP limits?",
];

export default function Home() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeTurnId, setActiveTurnId] = useState<number | null>(null);
  const ask = trpc.knowledge.ask.useMutation();
  const activeTurn = turns.find(turn => turn.id === activeTurnId) ?? turns.at(-1);

  const messages = useMemo<Message[]>(() => turns.flatMap(turn => [
    { role: "user", content: turn.question },
    { role: "assistant", content: turn.answer },
  ]), [turns]);

  const handleSend = (question: string) => {
    const id = Date.now();
    setActiveTurnId(id);
    ask.mutate({ question }, {
      onSuccess: result => setTurns(previous => [...previous, { id, question, answer: result.answer, passages: result.passages }]),
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#172033]">
      <header className="border-b border-[#e7eaf1] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#172033] text-white shadow-lg shadow-[#172033]/15"><Sparkles className="size-5" /></div>
            <div><div className="text-[15px] font-semibold tracking-tight">SourceDesk</div><div className="text-[11px] uppercase tracking-[0.22em] text-[#8b93a5]">Grounded intelligence</div></div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="rounded-full bg-[#eef1f7] px-4 py-2 font-medium text-[#172033]">Workspace</Link>
            <Link href="/build-log" className="rounded-full px-4 py-2 text-[#71798a] transition hover:bg-[#f2f4f8] hover:text-[#172033]">Build log</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7f8799]"><span className="size-2 rounded-full bg-[#5c8d77]" /> Live source connection</div><h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-[#172033] sm:text-5xl">Ask the source.<br /><span className="text-[#7e8798]">Keep the evidence.</span></h1><p className="mt-4 max-w-xl text-[15px] leading-7 text-[#697286]">A focused knowledge agent that retrieves from one curated handbook, answers with discipline, and keeps every citation in view.</p></div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#e3e7ef] bg-white px-4 py-3 shadow-sm"><ShieldCheck className="size-5 text-[#5c8d77]" /><div><div className="text-xs font-semibold text-[#172033]">Grounding enforced</div><div className="text-xs text-[#8991a2]">No outside context is passed to the model</div></div></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <Card className="overflow-hidden rounded-[28px] border-[#e3e7ef] bg-white shadow-[0_18px_60px_rgba(35,47,70,0.07)]">
              <div className="flex items-center justify-between border-b border-[#eef0f4] px-6 py-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#f0f4fa]"><BookOpen className="size-4 text-[#63718a]" /></div><div><div className="text-sm font-semibold">Knowledge chat</div><div className="text-xs text-[#9299a8]">sourcedesk-handbook.md · 7 sections</div></div></div><Badge className="border-0 bg-[#eaf3ed] text-[#4d7b64] hover:bg-[#eaf3ed]"><span className="mr-1.5 size-1.5 rounded-full bg-[#5c8d77]" />Connected</Badge></div>
              <AIChatBox messages={messages} onSendMessage={handleSend} isLoading={ask.isPending} height="min(680px, calc(100vh - 280px))" emptyStateMessage="Your evidence-first workspace is ready" suggestedPrompts={starterPrompts} placeholder="Ask a question about the handbook…" className="rounded-none border-0 shadow-none" />
            </Card>
            {ask.error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">The agent could not complete this run. Please try again.</div>}
          </section>

          <aside className="space-y-4">
            <Card className="rounded-[24px] border-[#e3e7ef] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><PanelRight className="size-4 text-[#738099]" /> Evidence trail</div><span className="text-xs text-[#a0a7b5]">{activeTurn?.passages.length ?? 0} sources</span></div>{activeTurn ? <div><div className="mb-4 rounded-2xl bg-[#f7f8fb] p-3"><div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9ba2b0]">Question</div><div className="text-sm leading-6 text-[#364158]">{activeTurn.question}</div></div><div className="space-y-3">{activeTurn.passages.map(passage => <div key={passage.id} className="rounded-2xl border border-[#e7eaf0] p-4"><div className="mb-2 flex items-center justify-between"><Badge variant="outline" className="border-[#cad8ed] bg-[#f5f8fd] text-[#4f6f9b]">[{passage.id}]</Badge><span className="text-[10px] uppercase tracking-[0.14em] text-[#a4aab5]">matched</span></div><div className="mb-1 text-xs font-semibold text-[#5e6b82]">{passage.heading}</div><p className="text-[13px] leading-6 text-[#687387]">“{passage.text}”</p></div>)}</div></div> : <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-[#fafbfc] px-6 text-center"><Search className="mb-3 size-5 text-[#aab2c0]" /><p className="text-sm font-medium text-[#6e788b]">Citations appear here</p><p className="mt-1 text-xs leading-5 text-[#a1a8b5]">Run a question to inspect the exact passages used by the agent.</p></div>}</Card>

            <Card className="rounded-[24px] border-[#e3e7ef] bg-[#172033] p-5 text-white shadow-sm"><div className="mb-4 flex items-center gap-2"><FileText className="size-4 text-[#aabbd3]" /><span className="text-sm font-semibold">Connected source</span></div><div className="rounded-2xl bg-white/8 p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-white/10"><FileText className="size-4 text-[#b9c8dc]" /></div><div className="min-w-0"><div className="truncate text-sm font-medium">sourcedesk-handbook.md</div><div className="text-xs text-[#9baac0]">Server-side · query-time read</div></div><CheckCircle2 className="ml-auto size-4 shrink-0 text-[#8ac0a1]" /></div></div><div className="mt-4 flex items-center justify-between text-xs text-[#9baac0]"><span>Retrieval mode</span><span className="font-medium text-[#d9e3f0]">Hybrid search</span></div></Card>

            <Card className="rounded-[24px] border-[#e3e7ef] bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-[#738099]" /> Session history <span className="ml-auto text-xs font-normal text-[#a0a7b5]">{turns.length}</span></div>{turns.length === 0 ? <p className="text-xs leading-5 text-[#9aa2b1]">Questions from this session will stay available here for review.</p> : <div className="space-y-2">{turns.slice().reverse().map(turn => <button key={turn.id} onClick={() => setActiveTurnId(turn.id)} className={`w-full rounded-xl p-3 text-left transition ${turn.id === activeTurn?.id ? "bg-[#eef1f7]" : "hover:bg-[#f7f8fb]"}`}><div className="line-clamp-2 text-xs leading-5 text-[#4e596e]">{turn.question}</div><div className="mt-2 line-clamp-2 text-xs leading-5 text-[#7b8495]">{turn.answer}</div><div className="mt-2 text-[10px] uppercase tracking-[0.13em] text-[#9ca4b2]">{turn.passages.map(passage => `[${passage.id}]`).join(" ") || "No cited passages"}</div>{turn.passages.length > 0 && <div className="mt-2 space-y-1 border-l border-[#d9dee8] pl-2 text-[10px] leading-4 text-[#9aa2b1]">{turn.passages.map(passage => <div key={passage.id} className="line-clamp-2">[{passage.id}] “{passage.text}”</div>)}</div>}</button>)}</div>}</Card>
          </aside>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-[#e4e7ed] pt-5 text-xs text-[#929aaa]"><span>FL-07 · Build checkpoint 1</span><Link href="/build-log" className="flex items-center gap-1 font-medium text-[#66748c] hover:text-[#172033]">Read the build log <ArrowUpRight className="size-3.5" /></Link></div>
      </main>
    </div>
  );
}
