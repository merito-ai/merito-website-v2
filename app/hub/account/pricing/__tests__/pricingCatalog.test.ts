import { describe, it, expect } from "vitest";
import { buildPricingCards, buildBundleSummary, getPersonalityBundleRate, buildPlanCards } from "../pricingCatalog";

describe("buildPlanCards", () => {
  const cards = buildPlanCards();

  it("returns both plans at flat prices", () => {
    expect(cards.map((c) => [c.product, c.priceLabel])).toEqual([
      ["plan_prepare", "₹2996"],
      ["plan_mentor", "₹5995"],
    ]);
  });

  it("lists the seminar value table in spec order", () => {
    for (const c of cards) {
      expect(c.lines.map((l) => l.label)).toEqual([
        "CV analysis with detailed report (3 roles)",
        "Personality + culture assessment",
        "Mock AI interview (45 min)",
        "References module",
        "1-hour mentoring session",
        "Application assistance (3 companies)",
        "Shareable profile",
      ]);
      expect(c.lines.map((l) => l.valueLabel)).toEqual(["₹499", "₹499", "₹1499", "₹499", "₹2999", "—", "—"]);
    }
    expect(cards[0].lines.map((l) => l.included)).toEqual([true, true, true, true, false, false, true]);
    expect(cards[1].lines.map((l) => l.included)).toEqual([true, true, true, true, true, true, true]);
  });

  it("only the mentor plan has the referral footnote, and nothing promises a guaranteed outcome", () => {
    expect(cards[0].footnote).toBeNull();
    expect(cards[1].footnote).toMatch(/we refer you/i);
    expect(JSON.stringify(cards)).not.toMatch(/guaranteed/i);
  });
});

describe("getPersonalityBundleRate", () => {
  it("derives entry-level personality bundle rate from bundle total minus report/references", () => {
    expect(getPersonalityBundleRate("entry")).toBe(15100); // ₹151
  });

  it("derives mid-level personality bundle rate", () => {
    expect(getPersonalityBundleRate("mid")).toBe(15100); // ₹151
  });

  it("derives senior-level personality bundle rate", () => {
    expect(getPersonalityBundleRate("senior")).toBe(15100); // ₹151
  });
});

describe("buildPricingCards", () => {
  it("returns all five products in a stable order", () => {
    const cards = buildPricingCards("entry");
    expect(cards.map((c) => c.key)).toEqual(["report", "personality", "references", "interview", "counselling"]);
  });

  it("marks report/personality/references as bundle-eligible and interview/counselling as not", () => {
    const cards = buildPricingCards("entry");
    const inBundle = Object.fromEntries(cards.map((c) => [c.key, c.inBundle]));
    expect(inBundle).toEqual({
      report: true,
      personality: true,
      references: true,
      interview: false,
      counselling: false,
    });
  });

  it("only personality carries a bundlePrice", () => {
    const cards = buildPricingCards("mid");
    for (const card of cards) {
      if (card.key === "personality") {
        expect(card.bundlePrice).toBe(15100);
        expect(card.bundlePriceLabel).toBe("₹151");
      } else {
        expect(card.bundlePrice).toBeNull();
        expect(card.bundlePriceLabel).toBeNull();
      }
    }
  });

  it("formats solo prices from the real pricing table for senior level", () => {
    const cards = buildPricingCards("senior");
    const byKey = Object.fromEntries(cards.map((c) => [c.key, c.priceLabel]));
    expect(byKey).toEqual({
      report: "₹299",
      personality: "₹299",
      references: "₹299",
      interview: "₹1499",
      counselling: "₹2999",
    });
  });
});

describe("buildBundleSummary", () => {
  it("computes entry-level savings", () => {
    const summary = buildBundleSummary("entry");
    expect(summary).toEqual({
      bundlePrice: 74900,
      bundlePriceLabel: "₹749",
      soloTotal: 89700,
      soloTotalLabel: "₹897",
      savings: 14800,
      savingsLabel: "₹148",
    });
  });

  it("computes mid-level savings", () => {
    const summary = buildBundleSummary("mid");
    expect(summary.savingsLabel).toBe("₹148");
  });

  it("computes senior-level savings", () => {
    const summary = buildBundleSummary("senior");
    expect(summary.savingsLabel).toBe("₹148");
  });
});
