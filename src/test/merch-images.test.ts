import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/merch";

describe("merch photos", () => {
  it("shows the real photos for the tumbler and the cloth", () => {
    const tumbler = PRODUCTS.find((p) => p.id === "tumbler")!;
    const cloth = PRODUCTS.find((p) => p.id === "cloth")!;

    expect(tumbler.image).toMatch(/mini-tumbler-cup\.jpg$/);
    expect(cloth.image).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/anniversary-cloth\.jpg$/),
        expect.stringMatching(/anniversary-cloth-shirt-style\.jpg$/),
        expect.stringMatching(/anniversary-cloth-shirt-dress-style\.jpg$/),
      ]),
    );
  });

  it("keeps every product photo a real image source", () => {
    for (const p of PRODUCTS) {
      const images = Array.isArray(p.image) ? p.image : [p.image];
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        expect(image).toMatch(/\.(jpg|jpeg|png)$/i);
      }
    }
  });

  it("uses both jersey images in the gallery", () => {
    const jersey = PRODUCTS.find((p) => p.id === "jersey")!;

    expect(jersey.image).toHaveLength(2);
    expect(jersey.image).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/jersey-front\.jpg$/),
        expect.stringMatching(/jersey-back\.jpg$/),
      ]),
    );
  });
});
