import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/merch";

describe("merch photos", () => {
  it("shows the real tumbler and cloth photos from media storage", () => {
    const tumbler = PRODUCTS.find((p) => p.id === "tumbler")!;
    const cloth = PRODUCTS.find((p) => p.id === "cloth")!;

    expect(tumbler.image).toMatch(/^\/__l5e\/assets-v1\/[0-9a-f-]+\/merch-tumbler\.jpg$/);
    expect(cloth.image).toMatch(/^\/__l5e\/assets-v1\/[0-9a-f-]+\/merch-cloth\.jpg$/);
  });

  it("keeps every product photo a real image source", () => {
    for (const p of PRODUCTS) {
      expect(p.image).toMatch(/\.(jpg|jpeg|png)$/i);
    }
  });
});
