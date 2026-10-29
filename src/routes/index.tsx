import { createFileRoute, Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, type ReactNode } from "react";
import hero from "@/assets/hero-field.jpg";
import logo from "@/assets/bethlehem-logo.jpg";
import { EVENT, SOCIAL, buildIcs, getMapUrl, getRemaining, getStartTimestamp } from "@/lib/event";
import { MerchStore } from "@/components/MerchStore";

const TITLE = "Festival of Praise @20 — 27 March 2027 | Golf City - Tema";
const DESC =
  "Two Decades of Praise. One Unforgettable Celebration. Open-air gospel concert at Golf City - Tema — Saturday 27 March 2027.";

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
            name: "Golf City - Tema",
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors ${scrolled ? "bg-deep/85 backdrop-blur-md shadow-lg" : ""}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 md:flex md:justify-between">
        <a href="#top" className="flex min-w-0 items-center gap-3 text-snow">
          <img src={logo} alt="Bethlehem Society Methodist Church Ghana logo" className="h-11 w-11 shrink-0 rounded-full" width={44} height={44} />
          <span className="min-w-0 font-display text-sm font-bold leading-tight">Festival of Praise<span className="text-sky">@20</span></span>
        </a>
        <nav aria-label="Main" className="hidden gap-7 md:flex">
          {NAV.map(([l, id]) => (
            <a key={id} href={`#${id}`} className="text-sm font-semibold text-snow/80 transition hover:text-snow">{l}</a>
          ))}
        </nav>
        <Button variant="ghost" size="icon" className="glass h-11 w-11 shrink-0 rounded-lg text-snow hover:bg-snow/10 hover:text-snow md:hidden" aria-label={open ? "Close" : "Menu"} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile" className="bg-deep/95 px-5 pb-5 md:hidden">
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

function addToCalendar() {
  const blob = new Blob([buildIcs()], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "festival-of-praise-20.ics";
  a.click();
  URL.revokeObjectURL(url);
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
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-sky">Countdown to Festival of Praise @20</p>
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
              <p className="mt-1 text-sm text-snow/75">Programme runs from late afternoon into the evening.</p>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={addToCalendar}
            className="rounded-full bg-snow px-8 py-4 font-bold text-royal shadow-[var(--glow)] transition hover:-translate-y-0.5 hover:bg-sky active:scale-95">
            Add to Calendar
          </button>
        </div>
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
            Festival of Praise @20 gathers the church and the wider community at Golf City - Tema for an open-air evening of worship,
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
        <Reveal delay={200}>
          <div className="mt-10 text-center">
            <a href={getMapUrl()} target="_blank" rel="noopener noreferrer"
              className="inline-block rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:-translate-y-0.5 active:scale-95">
              Get Directions on Google Maps
            </a>
          </div>
        </Reveal>
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

const ICONS: Record<string, ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M9.1 23.7v-8h-2.5v-3.7h2.5V10.4c0-4.1 1.8-6.5 6.5-6.5h3.9v3.7h-3.7c-1.8 0-2.5.6-2.5 2.5v1.6h6.1l-1 3.7h-5.1v8z" />
    </svg>
  ),
};

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
        <p className="mt-4 text-muted-foreground">Invite family and friends to Festival of Praise @20 at Golf City - Tema.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className={`${btn} bg-primary text-primary-foreground`} target="_blank" rel="noopener noreferrer"
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}>WhatsApp</a>
          <a className={`${btn} bg-royal text-snow`} target="_blank" rel="noopener noreferrer"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
          {canShare && (
            <button className={`${btn} border-2 border-primary text-primary`} onClick={() => navigator.share({ title: EVENT.name, text, url }).catch(() => {})}>Share…</button>
          )}
        </div>

        <div className="mt-14">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Follow us</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-full border bg-card px-5 py-3 text-royal transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
                <span className="h-5 w-5 text-primary">{ICONS[s.label]}</span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-bold">{s.label}</span>
                  <span className="block text-xs font-semibold text-muted-foreground">{s.handle}</span>
                </span>
              </a>
            ))}
          </div>
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
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-3 md:justify-start">
        {SOCIAL.map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${EVENT.organizer} on ${s.label}`}
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-snow transition hover:-translate-y-0.5 hover:text-sky active:scale-95">
            <span className="h-5 w-5">{ICONS[s.label]}</span>
          </a>
        ))}
      </div>
      <div className="mt-12 flex justify-center gap-6 text-sm font-semibold text-snow/75">
        <Link to="/privacy" className="hover:text-sky">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-sky">Terms of Use</Link>
      </div>
      <p className="mt-4 text-center text-sm text-snow/60">Made with ❤️ by Bethlehem Methodist Media</p>
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
