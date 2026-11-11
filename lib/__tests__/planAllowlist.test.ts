import { describe, it, expect, vi, beforeEach } from "vitest";

const maybeSingleMock = vi.fn();
const eqMock = vi.fn((_col: string, _val: string) => ({ maybeSingle: maybeSingleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: () => ({ select: selectMock }) }) }));
vi.mock("@/lib/adminAuditLog", () => ({ logAdminAction: vi.fn() }));

import { parseEmailList, isEmailAllowlisted } from "@/lib/planAllowlist";

describe("parseEmailList", () => {
  it("splits on newlines, commas, semicolons and spaces, lowercases and dedupes", () => {
    expect(parseEmailList("A@x.com, b@y.in\nA@X.com; c@z.org  bad-email")).toEqual({
      valid: ["a@x.com", "b@y.in", "c@z.org"],
      invalid: ["bad-email"],
    });
  });
  it("unwraps pasted mail-client formats and rejects addresses that can never match", () => {
    expect(parseEmailList('Asha Rao <Asha@X.com>, "b@y.in"; c@z.org. d@e f@g.c')).toEqual({
      valid: ["asha@x.com", "b@y.in", "c@z.org"],
      invalid: ["Asha", "Rao", "d@e", "f@g.c"],
    });
  });
  it("ignores empty input", () => {
    expect(parseEmailList(" \n ,")).toEqual({ valid: [], invalid: [] });
  });
});

describe("isEmailAllowlisted", () => {
  beforeEach(() => { eqMock.mockClear(); maybeSingleMock.mockReset(); });
  it("matches case-insensitively", async () => {
    maybeSingleMock.mockResolvedValue({ data: { email: "a@x.com" }, error: null });
    expect(await isEmailAllowlisted("  A@X.com ")).toBe(true);
    expect(eqMock).toHaveBeenCalledWith("email", "a@x.com");
  });
  it("returns false for a missing email without querying", async () => {
    expect(await isEmailAllowlisted(undefined)).toBe(false);
    expect(eqMock).not.toHaveBeenCalled();
  });
  it("throws on a DB error (fail closed, never sells to unlisted)", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(isEmailAllowlisted("a@x.com")).rejects.toThrow("boom");
  });
});
