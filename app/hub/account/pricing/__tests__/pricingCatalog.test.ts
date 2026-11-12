import { describe, it, expect } from "vitest";
import { buildPricingCards, buildBundleSummary, getPersonalityBundleRate, buildPlanCards, applyPlanToCards, planCta, planConfirmContent } from "../pricingCatalog";

describe("buildPlanCards", () => {
  const cards = buildPlanCards();

  it("returns both plans at flat, comma-grouped prices", () => {
    expect(cards.map((c) => [c.product, c.priceLabel])).toEqual([
      ["plan_prepare", "₹2,996"],
      ["plan_mentor", "₹5,995"],
    ]);
  });

  it("lists the comparison rows in PM order with ticks per plan", () => {
    for (const c of cards) {
      expect(c.lines.map((l) => l.label)).toEqual([
        "CV analysis with detailed report (3 roles)",
        "Personality + culture assessment",
        "Mock AI interview (45 min)",
        "References module",
        "Mentoring: 1 hour as two 30-min sessions",
        "Application assistance (3 companies, via Merito's network)",
        "Shareable consolidated profile",
      ]);
    }
    expect(cards[0].lines.map((l) => l.included)).toEqual([true, true, true, true, false, false, true]);
    expect(cards[1].lines.map((l) => l.included)).toEqual([true, true, true, true, true, true, true]);
  });

  it("offline/composite rows (and the interview validity) carry a helper, and nothing promises a guaranteed outcome", () => {
    expect(cards[1].lines.filter((l) => l.helper).map((l) => l.label)).toEqual([
      "Mock AI interview (45 min)",
      "Mentoring: 1 hour as two 30-min sessions",
      "Application assistance (3 companies, via Merito's network)",
      "Shareable consolidated profile",
    ]);
    expect(JSON.stringify(cards)).not.toMatch(/guaranteed/i);
  });
});

describe("planCta", () => {
  it("no plan: both plans are buyable", () => {
    expect(planCta("plan_prepare", null)).toEqual({ kind: "buy" });
    expect(planCta("plan_mentor", null)).toEqual({ kind: "buy" });
  });

  it("plan holder: own plan is active; Plan 1 upgrades to Plan 2; no downgrade (talk to us)", () => {
    expect(planCta("plan_prepare", "plan_prepare")).toEqual({ kind: "active" });
    expect(planCta("plan_mentor", "plan_prepare")).toEqual({ kind: "upgrade", priceLabel: "₹2,999" });
    expect(planCta("plan_mentor", "plan_mentor")).toEqual({ kind: "active" });
    expect(planCta("plan_prepare", "plan_mentor")).toEqual({ kind: "contact", href: "mailto:admin@merito.ai" });
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

describe("applyPlanToCards", () => {
  const base = buildPricingCards("entry");
  const plan = (over = {}) => ({ orderId: "o1", product: "plan_prepare" as const, interviewUsed: false, reportCreditsLeft: 2, ...over });
  const labels = (cs: ReturnType<typeof buildPricingCards>) => Object.fromEntries(cs.map((c) => [c.key, c.priceLabel]));

  it("no plan leaves the catalog unchanged", () => {
    expect(applyPlanToCards(base, null)).toEqual(base);
  });

  it("plan holder sees owned items as included, not priced or bundled", () => {
    const cs = applyPlanToCards(base, plan());
    expect(labels(cs)).toEqual({
      report: "Included · 2 left",
      personality: "Included in your plan",
      references: "Included in your plan",
      interview: "Included in your plan",
      counselling: "₹1999",
    });
    for (const c of cs) expect([c.inBundle, c.bundlePriceLabel]).toEqual([false, null]);
  });

  it("spent credits and used interview fall back to the normal price; Plan 2 includes mentoring", () => {
    const cs = applyPlanToCards(base, plan({ product: "plan_mentor", reportCreditsLeft: 0, interviewUsed: true }));
    expect(labels(cs)).toMatchObject({ report: "₹299", interview: "₹999", counselling: "Included in your plan" });
  });
});

describe("planConfirmContent", () => {
  const plans = buildPlanCards();
  const none = { personality: false, references: false, reportUnlocks: 0, interviewCredits: 0 };

  it("a plan lists its included rows, price and no note when nothing is owned", () => {
    const c = planConfirmContent(plans, "plan_prepare", none);
    expect([c.title, c.name, c.priceLabel]).toEqual(["Confirm your plan", "Assess + Prepare", "₹2,996"]);
    expect(c.rows.map((r) => r.label)).toEqual(plans[0].lines.filter((l) => l.included).map((l) => l.label));
    expect(c.alreadyOwned).toBeNull();
  });

  it("the upgrade lists only what it adds, at the upgrade price, with no owned note", () => {
    const c = planConfirmContent(plans, "plan_upgrade_mentor", { ...none, personality: true });
    expect([c.title, c.priceLabel]).toEqual(["Confirm your upgrade", "₹2,999"]);
    expect(c.rows.map((r) => r.label)).toEqual(["Mentoring: 1 hour as two 30-min sessions", "Application assistance (3 companies, via Merito's network)"]);
    expect(c.alreadyOwned).toBeNull();
  });

  it("lists features already bought individually; unknown ownership shows no note", () => {
    const c = planConfirmContent(plans, "plan_mentor", { personality: true, references: true, reportUnlocks: 2, interviewCredits: 1 });
    expect(c.alreadyOwned).toBe("2 role reports, the personality assessment, an unused mock interview, the references module");
    expect(planConfirmContent(plans, "plan_mentor", { ...none, reportUnlocks: 1 }).alreadyOwned).toBe("1 role report");
    expect(planConfirmContent(plans, "plan_mentor", null).alreadyOwned).toBeNull();
  });
});
