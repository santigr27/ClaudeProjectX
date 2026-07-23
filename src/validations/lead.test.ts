import { describe, expect, it } from "vitest";
import { leadInputSchema } from "./lead";

describe("leadInputSchema", () => {
  const validInput = {
    name: "María Rojas",
    email: "maria@example.com",
    phone: "+57 300 555 1234",
    message: "Hola, estoy interesado en esta propiedad.",
  };

  it("accepts a fully valid lead", () => {
    const result = leadInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a missing/empty phone since it is optional", () => {
    const result = leadInputSchema.safeParse({ ...validInput, phone: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = leadInputSchema.safeParse({ ...validInput, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = leadInputSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone with letters", () => {
    const result = leadInputSchema.safeParse({ ...validInput, phone: "call-me-maybe" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = leadInputSchema.safeParse({ ...validInput, message: "Hi" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name and message", () => {
    const result = leadInputSchema.safeParse({
      ...validInput,
      name: "  María Rojas  ",
      message: "  Hola, estoy interesado.  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("María Rojas");
      expect(result.data.message).toBe("Hola, estoy interesado.");
    }
  });
});
