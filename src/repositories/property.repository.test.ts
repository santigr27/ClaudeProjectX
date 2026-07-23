import { describe, expect, it } from "vitest";
import { buildWhere } from "./property.repository";

describe("buildWhere", () => {
  it("always scopes to published listings", () => {
    expect(buildWhere({})).toMatchObject({ status: "PUBLISHED" });
  });

  it("maps listingType directly", () => {
    expect(buildWhere({ listingType: "RENT" })).toMatchObject({ listingType: "RENT" });
  });

  it("maps propertyType as an `in` filter", () => {
    const where = buildWhere({ propertyType: ["APARTMENT", "HOUSE"] });
    expect(where.propertyType).toEqual({ in: ["APARTMENT", "HOUSE"] });
  });

  it("omits propertyType filter when the array is empty", () => {
    const where = buildWhere({ propertyType: [] });
    expect(where.propertyType).toBeUndefined();
  });

  it("builds a price range from minPrice/maxPrice", () => {
    const where = buildWhere({ minPrice: 100, maxPrice: 500 });
    expect(where.price).toEqual({ gte: 100, lte: 500 });
  });

  it("builds a one-sided price range when only minPrice is set", () => {
    const where = buildWhere({ minPrice: 100 });
    expect(where.price).toEqual({ gte: 100 });
  });

  it("uses gte for bedrooms/bathrooms/parkingSpaces (at-least semantics)", () => {
    const where = buildWhere({ bedrooms: 2, bathrooms: 1, parkingSpaces: 1 });
    expect(where.bedrooms).toEqual({ gte: 2 });
    expect(where.bathrooms).toEqual({ gte: 1 });
    expect(where.parkingSpaces).toEqual({ gte: 1 });
  });

  it("maps a bounding box onto latitude/longitude ranges", () => {
    const where = buildWhere({ bbox: { north: 5, south: 4, east: -73, west: -75 } });
    expect(where.latitude).toEqual({ gte: 4, lte: 5 });
    expect(where.longitude).toEqual({ gte: -75, lte: -73 });
  });

  it("builds a case-insensitive OR search across title/address/neighborhood/locality", () => {
    const where = buildWhere({ q: "Chicó" });
    expect(where.OR).toEqual([
      { title: { contains: "Chicó", mode: "insensitive" } },
      { address: { contains: "Chicó", mode: "insensitive" } },
      { neighborhood: { contains: "Chicó", mode: "insensitive" } },
      { locality: { contains: "Chicó", mode: "insensitive" } },
    ]);
  });

  it("ignores a blank/whitespace-only free-text query", () => {
    const where = buildWhere({ q: "   " });
    expect(where.OR).toBeUndefined();
  });
});
