import { describe, expect, it, vi, beforeEach } from "vitest";
import { submitLead } from "./lead.service";
import { createLead } from "@/repositories/lead.repository";

vi.mock("@/repositories/lead.repository", () => ({
  createLead: vi.fn(),
}));

const validInput = {
  name: "Camilo Torres",
  email: "camilo@example.com",
  phone: "+57 300 555 1234",
  message: "Hola, estoy interesado en esta propiedad.",
};

describe("submitLead", () => {
  beforeEach(() => {
    vi.mocked(createLead).mockReset();
  });

  it("persists a valid lead and reports success", async () => {
    vi.mocked(createLead).mockResolvedValue({} as never);

    const result = await submitLead(validInput);

    expect(result.success).toBe(true);
    expect(createLead).toHaveBeenCalledWith(expect.objectContaining({ name: "Camilo Torres" }));
  });

  it("returns field errors without touching the repository when input is invalid", async () => {
    const result = await submitLead({ ...validInput, email: "not-an-email" });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.email).toBeDefined();
    expect(createLead).not.toHaveBeenCalled();
  });

  it("returns a form-level error when the repository write fails", async () => {
    vi.mocked(createLead).mockRejectedValue(new Error("db unavailable"));

    const result = await submitLead(validInput);

    expect(result.success).toBe(false);
    expect(result.formError).toBeDefined();
  });
});
