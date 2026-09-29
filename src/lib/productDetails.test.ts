import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { gallerySlides, getDetails, productDetails } from "./productDetails";

describe("product details", () => {
  it("every catalog item has a description and at least 3 specs", () => {
    for (const item of catalog) {
      const details = getDetails(item.id);
      expect(details, item.id).toBeDefined();
      expect(details!.description.trim(), item.id).not.toBe("");
      expect(details!.specs.length, item.id).toBeGreaterThanOrEqual(3);
      for (const spec of details!.specs) {
        expect(spec.label.trim(), item.id).not.toBe("");
        expect(spec.value.trim(), item.id).not.toBe("");
      }
    }
  });

  it("has no details for ids missing from the catalog", () => {
    const ids = new Set(catalog.map((item) => item.id));
    for (const id of Object.keys(productDetails)) expect(ids.has(id), id).toBe(true);
  });

  it("extra images are paths under /public", () => {
    for (const [id, details] of Object.entries(productDetails)) {
      for (const src of details.images) expect(src.startsWith("/") && !src.startsWith("//"), `${id}: ${src}`).toBe(true);
    }
  });

  it("returns undefined for unknown ids", () => {
    expect(getDetails("nope")).toBeUndefined();
    expect(getDetails("toString")).toBeUndefined();
  });
});

describe("gallerySlides", () => {
  it("main image, then the in-space view, with no empty slots when there are no extra photos", () => {
    const item = catalog.find((i) => i.id === "coffee-station")!;
    const slides = gallerySlides(item, "Lounge");
    expect(slides.map((s) => s.kind)).toEqual(["image", "scene"]);
    expect(slides[0]).toMatchObject({ kind: "image", src: item.image });
    expect(slides[1].label).toBe("In your space (lounge)");
  });
});

describe("gallerySlides with a front-view thumbnail", () => {
  it("shows the thumbnail first and the scene image as a back view", () => {
    const item = { id: "chair-gaming", name: "Gaming Chair", image: "/items/chair-gaming.webp", thumbnail: "/items/chair-gaming-front.webp" };
    const slides = gallerySlides(item, "Workspace");
    expect(slides.map((s) => s.kind)).toEqual(["image", "scene", "image"]);
    expect(slides[0]).toMatchObject({ src: "/items/chair-gaming-front.webp" });
    expect(slides[2]).toMatchObject({ src: "/items/chair-gaming.webp", label: "Gaming Chair, back" });
  });
});
