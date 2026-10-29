import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/bethlehem-logo.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AGREEMENT_STORAGE_KEY, AGREEMENT_VERSION, canEnterSite, hasCurrentAgreement, isPolicyPath } from "@/lib/site-agreement";

export function SiteAgreement({ pathname, children }: { pathname: string; children: ReactNode }) {
  const [accepted, setAccepted] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    try { setAccepted(hasCurrentAgreement(localStorage.getItem(AGREEMENT_STORAGE_KEY))); }
    catch { /* Agreement can still be given for this visit when storage is unavailable. */ }
  }, []);

  function agree() {
    if (!canEnterSite(terms, privacy)) return;
    try { localStorage.setItem(AGREEMENT_STORAGE_KEY, AGREEMENT_VERSION); }
    catch { /* Keep this visit accessible without requiring browser storage. */ }
    setAccepted(true);
  }

  if (accepted || isPolicyPath(pathname)) return children;

  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b bg-deep px-5 py-7 text-snow">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <img src={logo} alt="Bethlehem Society Methodist Church Ghana logo" className="h-16 w-16 shrink-0 rounded-full" />
          <p className="text-lg font-bold">Festival of Praise @20</p>
        </div>
      </header>
      <section aria-labelledby="agreement-title" className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12">
        <h1 id="agreement-title" className="text-2xl font-bold leading-snug text-royal sm:text-3xl">Before you enter</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">Please read and agree to our Terms of Use and Privacy Policy to continue.</p>
        <div className="mt-8 space-y-6 border-y py-7">
          <div className="flex items-start gap-3">
            <Checkbox id="agree-terms" checked={terms} onCheckedChange={value => setTerms(value === true)} className="mt-1 h-5 w-5" aria-labelledby="terms-label" />
            <div id="terms-label" className="leading-relaxed"><label htmlFor="agree-terms" className="cursor-pointer">I agree to the </label><Link to="/terms" className="font-semibold text-primary underline underline-offset-4">Terms of Use</Link>.</div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="agree-privacy" checked={privacy} onCheckedChange={value => setPrivacy(value === true)} className="mt-1 h-5 w-5" aria-labelledby="privacy-label" />
            <div id="privacy-label" className="leading-relaxed"><label htmlFor="agree-privacy" className="cursor-pointer">I agree to the </label><Link to="/privacy" className="font-semibold text-primary underline underline-offset-4">Privacy Policy</Link>.</div>
          </div>
        </div>
        <Button onClick={agree} disabled={!canEnterSite(terms, privacy)} className="mt-7 h-12 w-full">Agree and enter <ArrowRight aria-hidden="true" /></Button>
      </section>
      <footer className="px-5 py-6 text-center text-sm text-muted-foreground">Made with ❤️ by Media</footer>
    </main>
  );
}