import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/merch";

describe("merch photos", () => {
  it("shows the real photos for the tumbler and the cloth", () => {
    const tumbler = PRODUCTS.find((p) => p.id === "tumbler")!;
    const cloth = PRODUCTS.find((p) => p.id === "cloth")!;

    expect(tumbler.image).toMatch(/mini-tumbler-cup\.jpg$/);
    expect(cloth.image).toMatch(/anniversary-cloth\.jpg$/);
  });

  it("keeps every product photo a real image source", () => {
    for (const p of PRODUCTS) {
      expect(p.image).toMatch(/\.(jpg|jpeg|png)$/i);
    }
  });
});
