import { describe, it, expect } from "vitest";
import golden from "./golden.json";
import { ITEMS, IMPRESSION_ITEMS, CONSISTENCY_PAIRS } from "@/lib/personality";
import { CULTURE_ITEMS } from "../cultureItems";

describe("item banks are verbatim ports of seed_data.py", () => {
  it("personality items", () => {
    expect(ITEMS.map((i) => ({ id: i.id, trait: i.t, reverse_keyed: i.k === "-", text: i.s }))).toEqual(
      golden.items.personality.map((i) => ({ id: i.id, trait: i.trait, reverse_keyed: i.reverse_keyed, text: i.text }))
    );
  });
  it("impression-management items and pairs", () => {
    expect(IMPRESSION_ITEMS.map((i) => ({ id: i.id, text: i.s }))).toEqual(golden.items.im);
    expect(CONSISTENCY_PAIRS).toEqual(golden.items.pairs);
  });
  it("culture items (order, keying, attention direction, text)", () => {
    expect(
      CULTURE_ITEMS.map((i) => ({
        id: i.id,
        culture: i.culture,
        reverse_keyed: i.reverse,
        is_attention_check: i.attention !== null,
        attention_direction: i.attention,
        text: i.text,
      }))
    ).toEqual(golden.items.culture);
  });
});
