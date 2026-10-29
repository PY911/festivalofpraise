export const AGREEMENT_VERSION = "2026-10-29";
export const AGREEMENT_STORAGE_KEY = "festival-praise-site-agreement";

export function isPolicyPath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/terms" || path === "/privacy";
}

export function canEnterSite(termsAccepted: boolean, privacyAccepted: boolean) {
  return termsAccepted && privacyAccepted;
}

export function hasCurrentAgreement(value: string | null) {
  return value === AGREEMENT_VERSION;
}