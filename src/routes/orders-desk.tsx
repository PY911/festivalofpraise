import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listOrders, setOrderStatus, ORDER_STATUSES } from "@/lib/orders-desk.functions";
import { money } from "@/lib/merch";

export const Route = createFileRoute("/orders-desk")({
  head: () => ({
    meta: [
      { title: "Orders Desk | Festival of Praise @20" },
      { name: "description", content: "Private merch orders desk." },
      { property: "og:title", content: "Orders Desk | Festival of Praise @20" },
      { property: "og:description", content: "Private merch orders desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrdersDesk,
});

type Order = Awaited<ReturnType<typeof listOrders>>["orders"][number];
type Item = { name: string; option?: string; qty: number; price?: number };

const itemsText = (o: Order) =>
  (JSON.parse(o.items) as Item[]).map((i) => `${i.qty} × ${i.name}${i.option ? ` (${i.option})` : ""}`).join(", ");

function OrdersDesk() {
  const load = useServerFn(listOrders);
  const update = useServerFn(setOrderStatus);
  const [pin, setPin] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const unlock = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await load({ data: { pin } });
      if (r.ok) setOrders(r.orders); else setErr("Wrong PIN.");
    } catch (x) { setErr(x instanceof Error ? x.message : "Something went wrong."); }
    setBusy(false);
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (orders ?? []).filter((o) => !s || o.customer_name.toLowerCase().includes(s) || o.phone.includes(s));
  }, [orders, q]);

  const changeStatus = async (id: string, status: (typeof ORDER_STATUSES)[number]) => {
    const r = await update({ data: { pin, id, status } });
    if (r.ok) setOrders((os) => os!.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [["Date", "Name", "Phone", "Items", "Total (GHS)", "Status", "Notes"],
      ...shown.map((o) => [new Date(o.created_at).toLocaleString(), o.customer_name, o.phone, itemsText(o), String(o.total_ghs), o.status, o.notes ?? ""])];
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "festival-orders.csv"; a.click();
  };

  if (!orders)
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-5">
        <form onSubmit={unlock} className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-xl">
          <h1 className="text-2xl font-black text-royal">Orders desk</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the team PIN to view orders.</p>
          <input type="password" autoComplete="current-password" value={pin} onChange={(e) => setPin(e.target.value)}
            className="mt-5 w-full rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary" placeholder="PIN" aria-label="PIN" />
          {err && <p className="mt-2 text-sm font-semibold text-destructive">{err}</p>}
          <button disabled={busy || !pin} className="mt-4 w-full rounded-full bg-royal px-6 py-3 font-bold text-snow disabled:opacity-50">
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
      </main>
    );

  return (
    <main className="min-h-screen bg-secondary px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-royal">Orders desk <span className="text-base text-muted-foreground">({orders.length})</span></h1>
          <div className="flex gap-2">
            <button onClick={() => unlock()} className="rounded-full border bg-card px-4 py-2 text-sm font-bold">Refresh</button>
            <button onClick={exportCsv} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Download spreadsheet</button>
          </div>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone"
          className="mt-5 w-full rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary" />
        <div className="mt-5 space-y-3">
          {shown.map((o) => (
            <article key={o.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{o.customer_name} · <a className="text-primary" href={`tel:${o.phone}`}>{o.phone}</a></p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <select aria-label="Status" value={o.status} onChange={(e) => changeStatus(o.id, e.target.value as (typeof ORDER_STATUSES)[number])}
                  className="rounded-full border bg-card px-3 py-1 text-sm font-semibold capitalize">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s === "new" ? "Awaiting payment" : s}</option>)}
                </select>
              </div>
              <p className="mt-2 text-sm">{itemsText(o)}</p>
              <p className="mt-1 text-sm font-black text-royal">{o.total_ghs ? money(o.total_ghs) : "Total TBA"}</p>
              {o.notes && <p className="mt-1 text-sm text-muted-foreground">Notes: {o.notes}</p>}
            </article>
          ))}
          {!shown.length && <p className="text-muted-foreground">No orders yet.</p>}
        </div>
      </div>
    </main>
  );
}
