import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Route } from "@/routes/index";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("renders the local church logo instead of the Lovable metadata URL", () => {
    const Comp = Route.options.component;
    if (!Comp) throw new Error("Route / has no component");
    render(<Comp />);

    const logos = screen.getAllByAltText("Bethlehem Society Methodist Church Ghana logo");

    expect(logos.length).toBeGreaterThan(0);
    logos.forEach((logo) => {
      expect((logo as HTMLImageElement).src).not.toContain("/__l5e/assets-v1/");
    });
  });
});
