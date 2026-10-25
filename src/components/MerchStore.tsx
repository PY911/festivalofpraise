import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_WHATSAPP, PRICES_ARE_SAMPLE, PRODUCTS, cartTotal, orderMessage, type CartLine } from "@/lib/merch";

export function MerchStore() {
  const [opts, setOpts] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const add = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const option = p.options ? opts[id] ?? p.options[1] : undefined;
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && l.option === option);
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l));
      const line: CartLine = option === undefined ? { id, name: p.name, qty: 1, price: p.price } : { id, name: p.name, option, qty: 1, price: p.price };
      return [...c, line];
    });
    setState("idle");
  };
  const setQty = (i: number, qty: number) =>
    setCart((c) => (qty <= 0 ? c.filter((_, j) => j !== i) : c.map((l, j) => (j === i ? { ...l, qty } : l))));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    const n = name.trim(), ph = phone.trim();
    if (n.length < 2 || !/^[+\d\s-]{7,20}$/.test(ph)) {
      setState("error"); setMsg("Please enter your name and a valid phone number."); return;
    }
    setState("saving");
    const { error } = await supabase.from("merch_orders").insert({
      customer_name: n, phone: ph, notes: notes.trim() || null, items: cart, total_ghs: cartTotal(cart),
    });
    if (error) { setState("error"); setMsg("Sorry, your order couldn't be saved. Please try again."); return; }
    setMsg(orderMessage(n, ph, cart, notes.trim()));
    setState("done");
    setCart([]);
  };

  const waHref = `https://wa.me/${ORDER_WHATSAPP ?? ""}?text=${encodeURIComponent(msg)}`;
  const field = "w-full rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary";

  return (
    <section id="merch" className="bg-secondary px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Festival store</p>
        <h2 className="mt-3 text-4xl font-black text-royal sm:text-5xl">Order your @20 merch</h2>
        <p className="mt-3 text-muted-foreground">
          Place your order now — pricing will be announced soon.
          {!PRICES_ARE_SAMPLE && <span className="ml-1 font-semibold text-primary">The final price list will be shared soon.</span>}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-primary">TBA</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-muted-foreground">Price to be announced soon</p>
                <div className="mt-4 flex gap-2">
                  {p.options && (
                    <select aria-label={`${p.name} size`} className="rounded-full border bg-card px-3 py-2 text-sm font-semibold"
                      value={opts[p.id] ?? p.options[1]} onChange={(e) => setOpts({ ...opts, [p.id]: e.target.value })}>
                      {p.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  )}
                  <button onClick={() => add(p.id)} className="flex-1 rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground transition hover:bg-royal active:scale-95">Add to order</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-8 rounded-3xl border bg-card p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-black text-royal">Your order</h3>
            {cart.length === 0 ? (
              <p className="mt-4 text-muted-foreground">{state === "done" ? "Thank you!" : "No items yet — add something above."}</p>
            ) : (
              <ul className="mt-4 divide-y">
                {cart.map((l, i) => (
                  <li key={`${l.id}-${l.option}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="font-semibold">{l.name}{l.option && <span className="text-muted-foreground"> · {l.option}</span>}</span>
                    <span className="flex items-center gap-2">
                      <button aria-label="Decrease" onClick={() => setQty(i, l.qty - 1)} className="h-8 w-8 rounded-full border font-bold">−</button>
                      <span className="w-6 text-center">{l.qty}</span>
                      <button aria-label="Increase" onClick={() => setQty(i, l.qty + 1)} className="h-8 w-8 rounded-full border font-bold">+</button>
                      <span className="w-24 text-right font-bold text-muted-foreground">TBA</span>
                    </span>
                  </li>
                ))}
                <li className="flex justify-between py-3 text-lg font-black"><span>Total</span><span className="text-muted-foreground">To be announced soon</span></li>
              </ul>
            )}
          </div>

          {state === "done" ? (
            <div className="rounded-2xl bg-secondary p-6" role="status">
              <p className="text-xl font-black text-royal">Order received ✓</p>
              <p className="mt-2 text-muted-foreground">Your order has been saved. Send it on WhatsApp too so the team can confirm quickly.</p>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Send on WhatsApp</a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input className={field} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
              <input className={field} placeholder="Phone (e.g. 024 123 4567)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} required />
              <textarea className={field} placeholder="Notes (optional)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
              {state === "error" && <p className="text-sm font-semibold text-destructive">{msg}</p>}
              <button disabled={!cart.length || state === "saving"} className="w-full rounded-full bg-royal px-6 py-4 font-bold text-snow transition hover:bg-primary disabled:opacity-50">
                {state === "saving" ? "Placing order…" : "Place order"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
