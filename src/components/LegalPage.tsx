import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-deep px-5 py-10 text-snow">
        <div className="mx-auto max-w-3xl">
          <Link to="/" className="text-sm font-semibold text-sky hover:underline">← Back to Festival of Praise @20</Link>
          <h1 className="mt-4 text-4xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-snow/70">Last updated: {updated}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed text-foreground [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-royal [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </main>
    </div>
  );
}

export function LegalContact() {
  return (
    <p>
      For questions, contact Bethlehem Society, Methodist Church Ghana, through our official pages:{" "}
      <a className="font-semibold text-primary underline" href="https://www.facebook.com/BethlehemSociety" target="_blank" rel="noopener noreferrer">Facebook</a>,{" "}
      <a className="font-semibold text-primary underline" href="https://www.instagram.com/bethlehemonline_/" target="_blank" rel="noopener noreferrer">Instagram</a> or{" "}
      <a className="font-semibold text-primary underline" href="https://www.tiktok.com/@bethlehemonline" target="_blank" rel="noopener noreferrer">TikTok</a>.
    </p>
  );
}
