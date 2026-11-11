import { describe, it, expect } from "vitest";
import { isInternalEmail, parseInternalList } from "../adminInternal";

describe("adminInternal", () => {
  it("parses a comma list of emails and domains", () => {
    expect(parseInternalList(" @Merito.in, qa@gmail.com ,,")).toEqual(["@merito.in", "qa@gmail.com"]);
    expect(parseInternalList("")).toEqual([]);
  });

  it("matches exact emails and @domain suffixes, case-insensitive", () => {
    const list = ["@merito.in", "qa@gmail.com"];
    expect(isInternalEmail("Roshan@MERITO.in", list)).toBe(true);
    expect(isInternalEmail("qa@gmail.com", list)).toBe(true);
    expect(isInternalEmail("realqa@gmail.com", list)).toBe(false);
    expect(isInternalEmail("someone@notmerito.in.example", list)).toBe(false);
    expect(isInternalEmail(null, list)).toBe(false);
    expect(isInternalEmail("x@merito.in", [])).toBe(false);
  });
});
