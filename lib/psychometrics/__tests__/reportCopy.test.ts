import { describe, it, expect } from "vitest";
import type { Scores } from "@/lib/personality";
import { strengthsAndDevelopment, cultureFitLine, CULTURE_CAVEATS, FIT_HIDDEN_TEXT, FLAT_TEXT, SELF_DEV_NOTE, SHARE_CULTURE_HEADING } from "../reportCopy";

const s = (E: number, A: number, C: number, ES: number, O: number): Scores => {
  const t = (pct: number) => ({ raw: 0, pct, band: 0 });
  return { E: t(E), A: t(A), C: t(C), ES: t(ES), O: t(O) };
};

describe("strengthsAndDevelopment", () => {
  it("top 2 by pct are strengths, bottom 2 (lowest first) are development", () => {
    expect(strengthsAndDevelopment(s(70, 20, 90, 40, 10))).toEqual({ strengths: ["C", "E"], development: ["O", "A"] });
  });
  it("ties break by TRAITS order", () => {
    expect(strengthsAndDevelopment(s(50, 50, 50, 50, 50))).toEqual({ strengths: ["E", "A"], development: ["O", "ES"] });
  });
});

describe("report copy", () => {
  it("has the 5 spec caveats", () => {
    expect(CULTURE_CAVEATS).toHaveLength(5);
    const all = CULTURE_CAVEATS.join(" ");
    for (const phrase of ["Teams inside one company", "modestly predicts", "Merito estimates", "not a hiring screen", "Clan"]) {
      expect(all).toContain(phrase);
    }
  });
  it("self-development note says not for hiring", () => expect(SELF_DEV_NOTE).toContain("not for hiring"));
  it("share heading labels culture as self-reported preferences, for development", () =>
    expect(SHARE_CULTURE_HEADING).toContain("self-reported preferences, for development"));
});

describe("cultureFitLine", () => {
  it("unreliable explains why fit is hidden, neutrally", () => {
    expect(cultureFitLine({ kind: "unreliable" })).toBe(FIT_HIDDEN_TEXT);
  });
  it("flat shows the adaptable text", () => {
    expect(cultureFitLine({ kind: "flat" })).toBe(FLAT_TEXT);
  });
  it("fit shows the top benchmark with its %", () => {
    const fits = [
      { key: "startup", label: "Early-stage startup", basis: "", fit: 98 },
      { key: "hospital", label: "Hospital / healthcare", basis: "", fit: 60 },
    ];
    expect(cultureFitLine({ kind: "fit", fits })).toBe("Closest organisation type: Early-stage startup (98% fit, Merito estimate)");
  });
});
