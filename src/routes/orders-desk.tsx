import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, LockKeyhole, LogOut, RefreshCw, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { listOrders, updateOrderStatus } from "@/lib/orders-desk.functions";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatMoney,
  formatOrderItems,
  ordersToCsv,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/orders-desk";

const TITLE = "Private Orders Desk | Festival of Praise @20";
const DESC = "Private merchandise order records for the Festival of Praise @20 order desk.";

export const Route = createFileRoute("/orders-desk")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersDesk,
});

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

function downloadCsv(orders: OrderRecord[]) {
  const blob = new Blob([ordersToCsv(orders)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `festival-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function OrdersDesk() {
  const listOrdersFn = useServerFn(listOrders);
  const updateStatusFn = useServerFn(updateOrderStatus);
  const [pin, setPin] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const visibleOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) =>
      [order.customer_name, order.phone, order.id, order.status]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [orders, query]);

  const totalValue = orders.reduce((sum, order) => sum + order.total_ghs, 0);

  async function loadOrders(secret: string) {
    setBusy(true);
    setError("");
    try {
      const result = await listOrdersFn({ data: { pin: secret } });
      if (!result.ok) {
        setUnlocked(false);
        setOrders([]);
        setError("That PIN didn't work. Please try again.");
        return;
      }
      setOrders(result.orders);
      setUnlocked(true);
    } catch {
      setError("Orders couldn't be loaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function unlock(event: FormEvent) {
    event.preventDefault();
    if (pin) void loadOrders(pin);
  }

  function lock() {
    setPin("");
    setOrders([]);
    setUnlocked(false);
    setQuery("");
    setError("");
  }

  async function changeStatus(orderId: string, status: OrderStatus) {
    setPendingStatus(orderId);
    setError("");
    try {
      const result = await updateStatusFn({ data: { pin, orderId, status } });
      if (!result.ok) {
        setError("That order couldn't be updated. Unlock the desk and try again.");
        return;
      }
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: result.status } : order)),
      );
    } catch {
      setError("That order couldn't be updated. Please try again.");
    } finally {
      setPendingStatus(null);
    }
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-5 py-16">
        <section className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">Private</p>
          <h1 className="mt-2 text-3xl font-black text-royal">Orders desk</h1>
          <p className="mt-3 text-muted-foreground">
            Enter the order-desk PIN to see customer orders and download the full records.
          </p>
          <form onSubmit={unlock} className="mt-6 space-y-4">
            <label htmlFor="orders-pin" className="block text-sm font-bold">
              Order-desk PIN
            </label>
            <input
              id="orders-pin"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              autoComplete="off"
              autoFocus
              required
              maxLength={200}
              className="w-full rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary"
            />
            {error && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
            <button
              disabled={!pin || busy}
              className="w-full rounded-full bg-royal px-6 py-3 font-bold text-snow transition hover:bg-primary disabled:opacity-50"
            >
              {busy ? "Checking…" : "Unlock orders"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary">
      <header className="bg-deep px-5 py-8 text-snow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky">Private</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Orders desk</h1>
          </div>
          <button
            onClick={lock}
            className="inline-flex items-center gap-2 rounded-full border border-snow/25 px-4 py-2 text-sm font-bold text-snow transition hover:bg-snow/10"
          >
            <LogOut size={17} aria-hidden="true" /> Lock desk
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold text-muted-foreground">All saved orders</p>
            <p className="mt-1 text-3xl font-black text-royal">{orders.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold text-muted-foreground">Combined order value</p>
            <p className="mt-1 text-3xl font-black text-royal">{formatMoney(totalValue)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border bg-card p-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search orders</span>
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, order ID or status"
              className="w-full rounded-xl border bg-card py-3 pl-11 pr-4 outline-none focus:border-primary"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void loadOrders(pin)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition hover:border-primary disabled:opacity-50"
            >
              <RefreshCw size={17} aria-hidden="true" className={busy ? "animate-spin" : ""} />
              {busy ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => downloadCsv(orders)}
              disabled={!orders.length}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-royal disabled:opacity-50"
            >
              <Download size={17} aria-hidden="true" /> Download all orders
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The download always includes every saved order, even when search narrows this screen.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <section aria-label="Order records" className="mt-6 space-y-4">
          {visibleOrders.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
              {orders.length ? "No orders match your search." : "No orders have been placed yet."}
            </div>
          ) : (
            visibleOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-royal">{order.customer_name}</h2>
                    <a href={`tel:${order.phone}`} className="mt-1 inline-block font-semibold text-primary">
                      {order.phone}
                    </a>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(order.created_at))}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-black text-royal">{formatMoney(order.total_ghs)}</p>
                    <label>
                      <span className="sr-only">Status for {order.customer_name}'s order</span>
                      <select
                        value={order.status}
                        disabled={pendingStatus === order.id}
                        onChange={(event) => void changeStatus(order.id, event.target.value as OrderStatus)}
                        className="rounded-full border bg-card px-3 py-2 text-sm font-bold"
                      >
                        {!ORDER_STATUSES.includes(order.status as OrderStatus) && (
                          <option value={order.status}>{order.status}</option>
                        )}
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Items</h3>
                    <p className="mt-2 whitespace-pre-line text-sm font-semibold">
                      {formatOrderItems(order.items)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{order.notes || "—"}</p>
                  </div>
                </div>
                <p className="mt-4 break-all text-xs text-muted-foreground">Order ID: {order.id}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
