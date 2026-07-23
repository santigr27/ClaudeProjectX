import { describe, expect, it, vi, beforeEach } from "vitest";
import { assertCanAddImages, InvalidImageError } from "./property-image.service";
import { countImagesByPropertyId } from "@/repositories/property-image.repository";

vi.mock("@/repositories/property-image.repository", () => ({
  countImagesByPropertyId: vi.fn(),
  createImage: vi.fn(),
  findImageById: vi.fn(),
  findImagesByPropertyId: vi.fn(),
  deleteImageById: vi.fn(),
}));

function makeFile(name: string, mimeType: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: mimeType });
}

describe("assertCanAddImages", () => {
  beforeEach(() => {
    vi.mocked(countImagesByPropertyId).mockReset();
    vi.mocked(countImagesByPropertyId).mockResolvedValue(0);
  });

  it("accepts valid JPEG/PNG/WebP files under the size limit", async () => {
    const files = [
      makeFile("a.jpg", "image/jpeg", 1024),
      makeFile("b.png", "image/png", 1024),
      makeFile("c.webp", "image/webp", 1024),
    ];
    await expect(assertCanAddImages(null, files)).resolves.toBeUndefined();
  });

  it("rejects a disallowed MIME type", async () => {
    const files = [makeFile("doc.pdf", "application/pdf", 1024)];
    await expect(assertCanAddImages(null, files)).rejects.toBeInstanceOf(InvalidImageError);
  });

  it("rejects a file over 5 MB", async () => {
    const files = [makeFile("huge.png", "image/png", 6 * 1024 * 1024)];
    await expect(assertCanAddImages(null, files)).rejects.toBeInstanceOf(InvalidImageError);
  });

  it("accepts a file exactly at the 5 MB limit", async () => {
    const files = [makeFile("exact.png", "image/png", 5 * 1024 * 1024)];
    await expect(assertCanAddImages(null, files)).resolves.toBeUndefined();
  });

  it("rejects when new files alone exceed the 10-image cap", async () => {
    const files = Array.from({ length: 11 }, (_, i) => makeFile(`${i}.png`, "image/png", 1024));
    await expect(assertCanAddImages(null, files)).rejects.toBeInstanceOf(InvalidImageError);
  });

  it("rejects when existing + new images together exceed the cap", async () => {
    vi.mocked(countImagesByPropertyId).mockResolvedValue(8);
    const files = Array.from({ length: 3 }, (_, i) => makeFile(`${i}.png`, "image/png", 1024));
    await expect(assertCanAddImages("property-1", files)).rejects.toBeInstanceOf(InvalidImageError);
  });

  it("accepts existing + new images right at the cap", async () => {
    vi.mocked(countImagesByPropertyId).mockResolvedValue(8);
    const files = Array.from({ length: 2 }, (_, i) => makeFile(`${i}.png`, "image/png", 1024));
    await expect(assertCanAddImages("property-1", files)).resolves.toBeUndefined();
  });

  it("does not query existing count for a brand-new property (propertyId null)", async () => {
    await assertCanAddImages(null, [makeFile("a.png", "image/png", 1024)]);
    expect(countImagesByPropertyId).not.toHaveBeenCalled();
  });
});
