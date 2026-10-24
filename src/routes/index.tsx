import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import hero from "@/assets/hero-field.jpg";
import logo from "@/assets/bethlehem-logo.jpg";
import { EVENT, getRemaining, getStartTimestamp } from "@/lib/event";
import { MerchStore } from "@/components/MerchStore";

const TITLE = "Festival of Praise @20 — 27 March 2027 | Bethlehem Methodist Church, Tema";
const DESC =
  "Two Decades of Praise. One Unforgettable Celebration. Open-air gospel concert on the Church Field, Bethlehem Methodist Church, Tema — Saturday 27 March 2027.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: "Festival of Praise @20 — 20 Years of Praise" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MusicEvent",
          name: EVENT.name,
          description: DESC,
          startDate: EVENT.date,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: "Church Field, Bethlehem Methodist Church",
            address: { "@type": "PostalAddress", addressLocality: "Tema", addressCountry: "GH" },
          },
          organizer: { "@type": "Organization", name: EVENT.organizer },
        }),
      },
    ],
  }),
  component: Index,
});

const NAV = [
  ["Countdown", "countdown"],
  ["About", "about"],
  ["Details", "details"],
  ["Highlights", "highlights"],
  ["Merch", "merch"],
  ["Share", "share"],
] as const;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e?.isIntersecting && (el.classList.add("is-visible"), io.disconnect()),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "bg-deep/85 backdrop-blur-md shadow-lg" : ""}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <a href="#top" className="flex items-center gap-3 text-snow">
          <img src={logo} alt="Bethlehem Society Methodist Church Ghana logo" className="h-11 w-11 rounded-full" width={44} height={44} />
          <span className="font-display text-sm font-bold leading-tight">Festival of Praise<span className="text-sky">@20</span></span>
        </a>
        <nav aria-label="Main" className="hidden gap-7 md:flex">
          {NAV.map(([l, id]) => (
            <a key={id} href={`#${id}`} className="text-sm font-semibold text-snow/80 transition hover:text-snow">{l}</a>
          ))}
        </nav>
        <button className="rounded-lg glass px-3 py-2 text-sm font-bold text-snow md:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="bg-deep/95 px-5 pb-5 md:hidden">
          {NAV.map(([l, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block border-b border-snow/10 py-3 font-semibold text-snow">{l}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const f = () => setY(window.scrollY);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const particles = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37) % 100,
    size: 2 + (i % 4),
    dur: 10 + (i % 7) * 2,
    delay: (i * 1.3) % 12,
  }));
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-deep text-snow">
      <img src={hero} alt="Worshippers with raised hands before a blue-lit outdoor stage on a church field at dusk" width={1920} height={1088}
        className="absolute inset-0 h-[120%] w-full object-cover opacity-60" style={{ transform: `translateY(${y * 0.3}px)` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-royal/40 to-deep" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="beam left-[8%]" />
        <span className="beam left-[40%]" style={{ animationDelay: "-3s", animationDuration: "11s" }} />
        <span className="beam left-[72%]" style={{ animationDelay: "-6s" }} />
        <span className="hidden md:block">
          {particles.map((p, i) => (
            <span key={i} className="particle" style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
          ))}
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-28 pb-16 text-center">
        <p className="animate-rise text-xs font-bold uppercase tracking-[0.4em] text-sky">Bethlehem Methodist Church, Tema presents</p>
        <h1 className="animate-rise mt-6 text-5xl font-black leading-[0.95] sm:text-7xl lg:text-8xl" style={{ animationDelay: ".2s" }}>
          Festival<br />of Praise
        </h1>
        <svg viewBox="0 0 560 200" className="mx-auto mt-2 w-72 overflow-visible sm:w-[30rem]" role="img" aria-label="@20">
          <text x="50%" y="160" textAnchor="middle" className="twenty-stroke" style={{ font: "900 160px Unbounded, sans-serif" }}>@20</text>
        </svg>
        <p className="animate-rise font-display text-lg font-bold uppercase tracking-[0.3em] text-sky" style={{ animationDelay: "1.8s" }}>20 Years of Praise</p>
        <p className="animate-rise mx-auto mt-5 max-w-2xl text-lg text-snow/85 sm:text-xl" style={{ animationDelay: "2.1s" }}>{EVENT.campaign}</p>
        <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold" style={{ animationDelay: "2.4s" }}>
          <span className="glass rounded-full px-5 py-2">{EVENT.dateLabel}</span>
          <span className="glass rounded-full px-5 py-2">{EVENT.venueShort}</span>
        </div>
        <div className="animate-rise mt-10 flex flex-wrap justify-center gap-4" style={{ animationDelay: "2.7s" }}>
          <a href="#about" className="rounded-full bg-snow px-8 py-4 font-bold text-royal shadow-[var(--glow)] transition hover:-translate-y-0.5 hover:bg-sky active:scale-95">Explore the Celebration</a>
          <a href="#share" className="rounded-full border-2 border-snow/70 px-8 py-4 font-bold text-snow transition hover:-translate-y-0.5 hover:bg-snow/10 active:scale-95">Share the Event</a>
        </div>
      </div>
    </section>
  );
}

function Countdown() {
  const target = getStartTimestamp(EVENT.date, EVENT.startTime);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const r = now ? getRemaining(target, now) : null;
  const units = r ? ([["Days", r.days], ["Hours", r.hours], ["Minutes", r.minutes], ["Seconds", r.seconds]] as const) : null;
  return (
    <section id="countdown" className="bg-night px-5 py-24 text-snow">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-sky">Counting down to festival day</p>
        <h2 className="mt-4 text-4xl font-black sm:text-6xl">{EVENT.dateLabel}</h2>
        <p className="mt-2 text-sky">{EVENT.dateNote}</p>
        <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-4" role="timer"
          aria-label={r ? `${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds until festival day` : "Countdown loading"}>
          {(units ?? ([["Days", 0], ["Hours", 0], ["Minutes", 0], ["Seconds", 0]] as const)).map(([l, v]) => (
            <div key={l} className="glass overflow-hidden rounded-2xl py-6">
              <div key={v} className="animate-rise font-display text-3xl font-black tabular-nums sm:text-6xl">{units ? String(v).padStart(2, "0") : "--"}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-sky sm:text-xs">{l}</div>
            </div>
          ))}
        </div>
        {!EVENT.startTime && (
          <div className="relative mx-auto mt-8 max-w-xl">
            <span aria-hidden className="ring-pulse absolute inset-0 rounded-3xl border-2 border-sky" />
            <div className="glass relative rounded-3xl px-6 py-5">
              <p className="font-display text-lg font-bold">Official Start Time to Be Announced</p>
              <p className="mt-1 text-sm text-snow/75">Programme runs late afternoon into the evening.</p>
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary">About the celebration</p>
          <h2 className="mt-4 text-4xl font-black text-royal sm:text-5xl">Twenty years. One song of gratitude.</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Festival of Praise @20 gathers the church and the wider community on the Church Field for an open-air evening of worship,
            thanksgiving and fellowship. As the afternoon light fades into night, we lift our voices together to celebrate two decades of praise
            and the faithfulness of God.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Details() {
  const items = [
    ["Date", `${EVENT.dateLabel} (${EVENT.dateNote})`],
    ["Venue", EVENT.venue],
    ["Programme", EVENT.programme],
    ["Start time", "Official Start Time to Be Announced"],
    ["Organizer", EVENT.organizer],
  ];
  return (
    <section id="details" className="bg-secondary px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal><h2 className="text-4xl font-black text-royal sm:text-5xl">Event details</h2></Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([k, v], i) => (
            <Reveal key={k} delay={i * 90}>
              <div className="h-full rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{k}</p>
                <p className="mt-2 text-lg font-semibold">{v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  const h = [
    ["Two Decades of Praise", "Celebrating twenty years of lifting voices in worship."],
    ["Worship & Thanksgiving", "An evening set apart to give thanks under the open sky."],
    ["A Celebration Together", "Church, families and neighbours gathered as one on the field."],
  ];
  return (
    <section id="highlights" className="bg-night px-5 py-24 text-snow">
      <div className="mx-auto max-w-6xl">
        <Reveal><h2 className="text-center text-4xl font-black sm:text-5xl">Anniversary highlights</h2></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {h.map(([t, d], i) => (
            <Reveal key={t} delay={i * 120}>
              <div className="glass group h-full rounded-3xl p-8 transition hover:-translate-y-1">
                <span className="font-display text-5xl font-black text-sky text-glow">0{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold">{t}</h3>
                <p className="mt-2 text-snow/75">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Share() {
  const [url, setUrl] = useState("");
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
    setCanShare(typeof navigator.share === "function");
  }, []);
  const text = `${EVENT.name} — ${EVENT.campaign} ${EVENT.dateLabel}, ${EVENT.venue}.`;
  const btn = "rounded-full px-6 py-3 font-bold transition hover:-translate-y-0.5 active:scale-95";
  return (
    <section id="share" className="px-5 py-24 text-center">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-4xl font-black text-royal sm:text-5xl">Share the celebration</h2>
        <p className="mt-4 text-muted-foreground">Invite family and friends to Festival of Praise @20.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className={`${btn} bg-primary text-primary-foreground`} target="_blank" rel="noopener noreferrer"
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}>WhatsApp</a>
          <a className={`${btn} bg-royal text-snow`} target="_blank" rel="noopener noreferrer"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
          <a className={`${btn} bg-pink-600 text-white`} target="_blank" rel="noopener noreferrer"
            href="https://www.instagram.com/" aria-label="Instagram">Instagram</a>
          <a className={`${btn} bg-sky-500 text-snow`} target="_blank" rel="noopener noreferrer"
            href="https://www.tiktok.com/" aria-label="TikTok">TikTok</a>
          {canShare && (
            <button className={`${btn} border-2 border-primary text-primary`} onClick={() => navigator.share({ title: EVENT.name, text, url }).catch(() => {})}>Share…</button>
          )}
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <footer className="bg-deep px-5 pt-1 pb-10 text-snow">
      <div aria-hidden className="shimmer-line mx-auto h-px max-w-6xl" />
      <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <img src={logo} alt="Bethlehem Society Methodist Church Ghana logo" className="h-20 w-20 rounded-full" loading="lazy" width={80} height={80} />
        <div>
          <p className="font-display text-2xl font-black">Festival of Praise <span className="text-sky">@20</span></p>
          <p className="text-sky">20 Years of Praise</p>
          <p className="mt-3 text-snow/75">{EVENT.dateLabel} · {EVENT.venue}</p>
          <p className="text-snow/75">Organized by {EVENT.organizer}</p>
        </div>
      </div>
      <p className="mt-12 text-center text-sm text-snow/60">Made with ❤️ by Bethlehem Media</p>
      <button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-5 bottom-5 z-40 h-12 w-12 rounded-full bg-snow font-bold text-royal shadow-[var(--glow)] transition-all hover:-translate-y-1 ${show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>↑</button>
    </footer>
  );
}

function Index() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Countdown />
        <About />
        <Details />
        <Highlights />
        <MerchStore />
        <Share />
      </main>
      <Footer />
    </>
  );
}
