import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/bethlehem-logo.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AGREEMENT_STORAGE_KEY,
  canEnterSite,
  hasCurrentAgreement,
  isPolicyPath,
  AGREEMENT_VERSION,
} from "@/lib/site-agreement";

export function SiteAgreement({ pathname, children }: { pathname: string; children: ReactNode }) {
  const [accepted, setAccepted] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    try {
      setAccepted(hasCurrentAgreement(localStorage.getItem(AGREEMENT_STORAGE_KEY)));
    } catch {
      setAccepted(false);
    }
  }, []);

  function agree() {
    if (!canEnterSite(terms, privacy)) return;
    try {
      localStorage.setItem(AGREEMENT_STORAGE_KEY, AGREEMENT_VERSION);
    } catch {
      // Allow entry for this visit if browser storage is unavailable.
    }
    setAccepted(true);
  }

  if (accepted || isPolicyPath(pathname)) return children;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-secondary px-4 py-8 text-foreground">
      <section
        aria-labelledby="agreement-title"
        className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl sm:p-8"
      >
        <header className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Bethlehem Society Methodist Church Ghana logo"
            className="h-14 w-14 rounded-full"
          />
          <h1 id="agreement-title" className="mt-3 text-xl font-bold text-royal">
            Festival of Praise @20
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Please review and agree to both policies to continue.
          </p>
        </header>
        <div className="mt-6 space-y-4 border-y py-5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-terms"
              checked={terms}
              onCheckedChange={(value) => setTerms(value === true)}
              className="mt-1 h-5 w-5"
              aria-labelledby="terms-label"
            />
            <div id="terms-label" className="text-sm leading-relaxed">
              <label htmlFor="agree-terms" className="cursor-pointer">
                I agree to the{" "}
              </label>
              <Link to="/terms" className="font-semibold text-primary underline underline-offset-4">
                Terms of Use
              </Link>
              .
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-privacy"
              checked={privacy}
              onCheckedChange={(value) => setPrivacy(value === true)}
              className="mt-1 h-5 w-5"
              aria-labelledby="privacy-label"
            />
            <div id="privacy-label" className="text-sm leading-relaxed">
              <label htmlFor="agree-privacy" className="cursor-pointer">
                I agree to the{" "}
              </label>
              <Link
                to="/privacy"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
        <Button
          onClick={agree}
          disabled={!canEnterSite(terms, privacy)}
          className="mt-6 h-11 w-full"
        >
          Continue <ArrowRight aria-hidden="true" />
        </Button>
      </section>
      <footer className="mt-5 px-5 text-center text-xs text-muted-foreground">
        Made with ❤️ by Bethlehem Information Lab (BIL)
      </footer>
    </main>
  );
}
