import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LegalContact } from "@/components/LegalPage";
import { SOCIAL } from "@/lib/event";

describe("Legal page contact links", () => {
  const html = renderToStaticMarkup(<LegalContact />);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  it("links every official social page supplied by the church", () => {
    for (const s of SOCIAL) {
      expect(hrefs).toContain(s.url);
      expect(html).toContain(s.handle);
    }
  });

  it("embeds each handle inside its link text", () => {
    for (const s of SOCIAL) {
      expect(html).toContain(`>${s.label} (${s.handle})</a>`);
    }
  });

  it("links nothing but the official social pages", () => {
    const official = SOCIAL.map((s) => s.url);
    expect(hrefs).toHaveLength(official.length);
    for (const href of hrefs) expect(official).toContain(href);
  });
});
