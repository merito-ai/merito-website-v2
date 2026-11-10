import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ALL_ITEM_IDS } from "@/lib/personality";
import { CULTURE_ITEMS } from "@/lib/psychometrics/cultureItems";

const getUserMock = vi.fn();
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } }),
}));

const isProductUnlockedMock = vi.fn();
vi.mock("@/lib/productUnlocks", () => ({
  isProductUnlocked: isProductUnlockedMock,
}));

const getPlanOrderMock = vi.fn().mockResolvedValue(null);
vi.mock("@/lib/plans", () => ({ getPlanOrder: getPlanOrderMock }));

const upsertMock = vi.fn().mockResolvedValue({ error: null });
const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
const updateEqMock = vi.fn().mockResolvedValue({ error: null });
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      upsert: upsertMock,
      update: updateMock,
      select: () => ({ eq: () => ({ maybeSingle: maybeSingleMock }) }),
    }),
  }),
}));

async function importRoute() {
  return await import("../route");
}

function completeAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  ALL_ITEM_IDS.forEach((id) => {
    answers[id] = 3;
  });
  return answers;
}

describe("POST /api/hub/save-personality-test — payment gate", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    isProductUnlockedMock.mockReset();
    upsertMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 402 when personality is not unlocked and bypass is off", async () => {
    vi.stubEnv("RAZORPAY_BYPASS", "false");
    isProductUnlockedMock.mockResolvedValue(false);
    const { POST } = await importRoute();

    const request = new Request("http://localhost/api/hub/save-personality-test", {
      method: "POST",
      body: JSON.stringify({ roleTitle: "Backend Engineer", answers: completeAnswers() }),
    });
    const response = await POST(request);

    expect(response.status).toBe(402);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("proceeds when personality is unlocked and bypass is off", async () => {
    vi.stubEnv("RAZORPAY_BYPASS", "false");
    isProductUnlockedMock.mockResolvedValue(true);
    const { POST } = await importRoute();

    const request = new Request("http://localhost/api/hub/save-personality-test", {
      method: "POST",
      body: JSON.stringify({ roleTitle: "Backend Engineer", answers: completeAnswers() }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", role_title: "Backend Engineer" }),
      { onConflict: "user_id" }
    );
  });

  it("proceeds without checking unlock status when bypass is on", async () => {
    vi.stubEnv("RAZORPAY_BYPASS", "true");
    const { POST } = await importRoute();

    const request = new Request("http://localhost/api/hub/save-personality-test", {
      method: "POST",
      body: JSON.stringify({ roleTitle: "Backend Engineer", answers: completeAnswers() }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(isProductUnlockedMock).not.toHaveBeenCalled();
  });

  it("returns 402 when RAZORPAY_BYPASS is unset (fail closed)", async () => {
    isProductUnlockedMock.mockResolvedValue(false);
    const { POST } = await importRoute();

    const request = new Request("http://localhost/api/hub/save-personality-test", {
      method: "POST",
      body: JSON.stringify({ roleTitle: "Backend Engineer", answers: completeAnswers() }),
    });
    const response = await POST(request);

    expect(response.status).toBe(402);
    expect(upsertMock).not.toHaveBeenCalled();
  });
});

function post(body: unknown) {
  return importRoute().then(({ POST }) =>
    POST(new Request("http://localhost/api/hub/save-personality-test", { method: "POST", body: JSON.stringify(body) }))
  );
}

function cultureAnswers(v = 4): Record<string, number> {
  return Object.fromEntries(CULTURE_ITEMS.map((i) => [i.id, v]));
}

describe("POST /api/hub/save-personality-test — v2 two-part flow", () => {
  beforeEach(() => {
    vi.stubEnv("RAZORPAY_BYPASS", "false");
    getUserMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    isProductUnlockedMock.mockReset();
    isProductUnlockedMock.mockResolvedValue(true);
    upsertMock.mockClear();
    updateMock.mockClear();
    updateEqMock.mockClear();
    maybeSingleMock.mockReset();
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("(a) no part = personality (old clients): upserts version 2 and clears culture columns", async () => {
    const res = await post({ roleTitle: "Backend Engineer", answers: completeAnswers() });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).sort()).toEqual(["scores", "validity"]);
    expect(json.scores.E).toEqual({ raw: 36, pct: 50, band: 2 });
    expect(json.validity.flags).toEqual([
      "central-tendency (fence-sitting)",
      "the same answer given to 60 statements in a row (possible straight-lining)",
    ]);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        version: 2,
        culture_scores: null,
        culture_reliable: null,
        culture_answers: null,
        culture_completed_at: null,
      }),
      { onConflict: "user_id" }
    );
  });

  it("(b) incomplete personality answers -> 400", async () => {
    const a = completeAnswers();
    delete a[String(ALL_ITEM_IDS[0])];
    expect((await post({ roleTitle: "X", part: "personality", answers: a })).status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("(c) personality value 6 -> 400", async () => {
    const a = completeAnswers();
    a[String(ALL_ITEM_IDS[0])] = 6;
    expect((await post({ roleTitle: "X", part: "personality", answers: a })).status).toBe(400);
  });

  it("(d) culture part on a v2 row updates culture columns", async () => {
    maybeSingleMock.mockResolvedValue({ data: { version: 2 }, error: null });
    const res = await post({ roleTitle: "X", part: "culture", answers: { ...cultureAnswers(4), attn1: 1, attn2: 1, attn3: 7 } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ culture: { scores: { Clan: 50, Adhocracy: 50, Market: 50, Hierarchy: 50 }, reliable: true } });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        culture_scores: { Clan: 50, Adhocracy: 50, Market: 50, Hierarchy: 50 },
        culture_reliable: true,
        culture_answers: expect.objectContaining({ c1: 4, attn3: 7 }),
        culture_completed_at: expect.any(String),
      })
    );
    expect(updateEqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it.each([[null], [{ version: 1 }]])("(e) culture part with row %j -> 409", async (row) => {
    maybeSingleMock.mockResolvedValue({ data: row, error: null });
    const res = await post({ roleTitle: "X", part: "culture", answers: cultureAnswers() });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("Finish part 1 first.");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("(f) culture value 8 -> 400", async () => {
    maybeSingleMock.mockResolvedValue({ data: { version: 2 }, error: null });
    expect((await post({ roleTitle: "X", part: "culture", answers: { ...cultureAnswers(), c1: 8 } })).status).toBe(400);
  });

  it("(g) unknown culture id -> 400", async () => {
    maybeSingleMock.mockResolvedValue({ data: { version: 2 }, error: null });
    expect((await post({ roleTitle: "X", part: "culture", answers: { ...cultureAnswers(), zz: 4 } })).status).toBe(400);
  });

  it("incomplete culture answers -> 400", async () => {
    maybeSingleMock.mockResolvedValue({ data: { version: 2 }, error: null });
    const a = cultureAnswers();
    delete a.c1;
    expect((await post({ roleTitle: "X", part: "culture", answers: a })).status).toBe(400);
  });

  it("culture part still requires the personality unlock (402)", async () => {
    isProductUnlockedMock.mockResolvedValue(false);
    expect((await post({ roleTitle: "X", part: "culture", answers: cultureAnswers() })).status).toBe(402);
  });

  it.each([
    ["complete v1, no plan", { version: 1, culture_scores: null }, null],
    ["complete v2", { version: 2, culture_scores: { Clan: 50 } }, { orderId: "o1" }],
  ])("part 1 over a %s row -> 409, row untouched", async (_label, row, plan) => {
    maybeSingleMock.mockResolvedValue({ data: row, error: null });
    getPlanOrderMock.mockResolvedValue(plan);
    const res = await post({ roleTitle: "X", answers: completeAnswers() });
    expect(res.status).toBe(409);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it.each([
    ["v1 row with a plan (retake-eligible)", { version: 1, culture_scores: null }, { orderId: "o1" }],
    ["incomplete v2 row", { version: 2, culture_scores: null }, null],
  ])("part 1 over a %s -> 200", async (_label, row, plan) => {
    maybeSingleMock.mockResolvedValue({ data: row, error: null });
    getPlanOrderMock.mockResolvedValue(plan);
    expect((await post({ roleTitle: "X", part: "personality", answers: completeAnswers() })).status).toBe(200);
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });
});
