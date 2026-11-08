import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/merch";

describe("merch photos", () => {
  it("bundles the tumbler and cloth photos with the app", () => {
    const tumbler = PRODUCTS.find((p) => p.id === "tumbler")!;
    const cloth = PRODUCTS.find((p) => p.id === "cloth")!;

    expect(tumbler.image).toMatch(/merch-tumbler(?:-[\w-]+)?\.jpg$/);
    expect(cloth.image).toMatch(/merch-cloth(?:-[\w-]+)?\.jpg$/);
  });

  it("keeps every product photo a real image source", () => {
    for (const p of PRODUCTS) {
      expect(p.image).toMatch(/\.(jpg|jpeg|png)$/i);
    }
  });
});
