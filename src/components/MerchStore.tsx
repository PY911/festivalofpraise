import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ORDER_WHATSAPP,
  PRICE_NOTE,
  PRODUCTS,
  fromPrice,
  money,
  orderMessage,
  priceFor,
  quotedTotal,
  type CartLine,
} from "@/lib/merch";

function ProductImages({
  name,
  images,
  fit,
  fillBackground = false,
}: {
  name: string;
  images: string[];
  fit: "cover" | "contain";
  fillBackground?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const showImage = (index: number) => setActiveIndex((index + images.length) % images.length);
  const imageLabel =
    images.length === 2 ? (activeIndex === 0 ? "front" : "back") : `image ${activeIndex + 1}`;

  return (
    <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden">
      {fillBackground && (
        <img
          src={images[activeIndex]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md opacity-40"
        />
      )}
      <img
        src={images[activeIndex]}
        alt={`${name} ${imageLabel}`}
        loading="lazy"
        width={816}
        height={816}
        className={`relative h-full w-full transition-opacity duration-500 ${
          fillBackground ? "bg-transparent" : "bg-muted"
        } ${fit === "cover" ? "object-cover" : "object-contain"}`}
      />
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label={`Previous ${name} image`}
            onClick={() => showImage(activeIndex - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-deep/75 text-snow shadow"
          >
            ‹
          </button>
          <div
            className="flex items-center gap-2 rounded-full bg-deep/75 px-3 py-2"
            aria-label={`${name} image ${activeIndex + 1} of ${images.length}`}
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show ${name} image ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => showImage(index)}
                className={`h-2.5 w-2.5 rounded-full ${activeIndex === index ? "bg-snow" : "bg-snow/50"}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label={`Next ${name} image`}
            onClick={() => showImage(activeIndex + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-deep/75 text-snow shadow"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

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
    if (p.inStock === false) return;
    const option = p.options
      ? (opts[id] ?? (p.optionPrices ? p.options[0] : p.options[1]))
      : undefined;
    const price = priceFor(p, option);
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && l.option === option);
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l));
      const line: CartLine =
        option === undefined
          ? { id, name: p.name, qty: 1, price }
          : { id, name: p.name, option, qty: 1, price };
      return [...c, line];
    });
    setState("idle");
  };
  const setQty = (i: number, qty: number) =>
    setCart((c) =>
      qty <= 0 ? c.filter((_, j) => j !== i) : c.map((l, j) => (j === i ? { ...l, qty } : l)),
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    const n = name.trim(),
      ph = phone.trim();
    if (n.length < 2 || !/^[+\d\s-]{7,20}$/.test(ph)) {
      setState("error");
      setMsg("Please enter your name and a valid phone number.");
      return;
    }
    setState("saving");
    const { error } = await supabase.from("merch_orders").insert({
      customer_name: n,
      phone: ph,
      notes: notes.trim() || null,
      items: cart,
      total_ghs: quoted ?? 0,
    });
    if (error) {
      setState("error");
      setMsg("Sorry, your order couldn't be saved. Please try again.");
      return;
    }
    setMsg(orderMessage(n, ph, cart, notes.trim()));
    setState("done");
    setCart([]);
  };

  const quoted = quotedTotal(cart);
  const waHref = `https://wa.me/${ORDER_WHATSAPP ?? ""}?text=${encodeURIComponent(msg)}`;
  const field = "w-full rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary";

  return (
    <section id="merch" className="bg-secondary px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Festival store</p>
        <h2 className="mt-3 text-4xl font-black text-royal sm:text-5xl">Order your @20 merch</h2>
        <p className="mt-3 text-muted-foreground">{PRICE_NOTE}</p>

        <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => {
            const isAvailable = p.inStock !== false;
            const badge = !isAvailable
              ? "Out of stock"
              : fromPrice(p) === undefined
                ? "TBA"
                : p.optionPrices
                  ? `From ${money(fromPrice(p)!)}`
                  : money(fromPrice(p)!);
            const images = Array.isArray(p.image) ? p.image : [p.image];
            return (
              <article
                key={p.id}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-1 hover:shadow-xl"
              >
                <ProductImages
                  name={p.name}
                  images={images}
                  fit={["brooch", "air-refresher"].includes(p.id) ? "cover" : "contain"}
                  fillBackground={p.id === "cloth"}
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wide ${isAvailable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {badge}
                    </span>
                  </div>
                  {p.optionPrices ? (
                    <div
                      className="mt-3 flex flex-wrap gap-2"
                      role="radiogroup"
                      aria-label={`${p.name} options`}
                    >
                      {p.options!.map((o) => {
                        const selected = (opts[p.id] ?? p.options![0]) === o;
                        return (
                          <button
                            key={o}
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setOpts({ ...opts, [p.id]: o })}
                            className={`rounded-2xl border px-3 py-2 text-left transition active:scale-95 ${
                              selected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "bg-card hover:border-primary/50"
                            } ${!isAvailable ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <span className="block text-xs font-semibold text-muted-foreground">
                              {o}
                            </span>
                            <span
                              className={`block text-sm font-black ${selected ? "text-primary" : ""}`}
                            >
                              {money(p.optionPrices![o]!)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    (isAvailable || p.price !== undefined) && (
                      <p className="mt-3 text-sm font-semibold text-muted-foreground">
                        {p.price === undefined ? "Price to be announced soon" : money(p.price)}
                        {p.note ? ` · ${p.note}` : ""}
                      </p>
                    )
                  )}
                  <div className="mt-auto flex gap-2 pt-4">
                    {p.options && !p.optionPrices && (
                      <select
                        aria-label={`${p.name} size`}
                        className="rounded-full border bg-card px-3 py-2 text-sm font-semibold"
                        value={opts[p.id] ?? p.options[1]}
                        onChange={(e) => setOpts({ ...opts, [p.id]: e.target.value })}
                      >
                        {p.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => add(p.id)}
                      disabled={!isAvailable}
                      className="flex-1 rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground transition hover:bg-royal active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {isAvailable ? "Add to order" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 rounded-3xl border bg-card p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-black text-royal">Your order</h3>
            {cart.length === 0 ? (
              <p className="mt-4 text-muted-foreground">
                {state === "done" ? "Thank you!" : "No items yet — add something above."}
              </p>
            ) : (
              <ul className="mt-4 divide-y">
                {cart.map((l, i) => (
                  <li
                    key={`${l.id}-${l.option}`}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <span className="font-semibold">
                      {l.name}
                      {l.option && <span className="text-muted-foreground"> · {l.option}</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      <button
                        aria-label="Decrease"
                        onClick={() => setQty(i, l.qty - 1)}
                        className="h-8 w-8 rounded-full border font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{l.qty}</span>
                      <button
                        aria-label="Increase"
                        onClick={() => setQty(i, l.qty + 1)}
                        className="h-8 w-8 rounded-full border font-bold"
                      >
                        +
                      </button>
                      <span className="w-24 text-right font-bold text-muted-foreground">
                        {l.price === undefined ? "TBA" : money(l.price * l.qty)}
                      </span>
                    </span>
                  </li>
                ))}
                <li className="flex justify-between py-3 text-lg font-black">
                  <span>Total</span>
                  <span className={quoted === null ? "text-muted-foreground" : "text-royal"}>
                    {quoted === null ? "To be announced soon" : money(quoted)}
                  </span>
                </li>
              </ul>
            )}
          </div>

          {state === "done" ? (
            <div className="rounded-2xl bg-secondary p-6" role="status">
              <p className="text-xl font-black text-royal">Order received ✓</p>
              <p className="mt-2 text-muted-foreground">
                Your order has been saved. Send it on WhatsApp too so the team can confirm quickly.
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
              >
                Send on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                className={field}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
              <input
                className={field}
                placeholder="Phone (e.g. 024 123 4567)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                required
              />
              <textarea
                className={field}
                placeholder="Notes (optional)"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
              {state === "error" && <p className="text-sm font-semibold text-destructive">{msg}</p>}
              <button
                disabled={!cart.length || state === "saving"}
                className="w-full rounded-full bg-royal px-6 py-4 font-bold text-snow transition hover:bg-primary disabled:opacity-50"
              >
                {state === "saving" ? "Placing order…" : "Place order"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
