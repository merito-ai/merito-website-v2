import { describe, it, expect, vi, beforeEach } from "vitest";

const verifyOtpMock = vi.fn();
const getUserMock = vi.fn();
const claimFitmentLeadsMock = vi.fn();

vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({
    auth: { verifyOtp: verifyOtpMock, getUser: getUserMock },
  }),
}));
vi.mock("@/lib/claimFitmentLeads", () => ({
  claimFitmentLeads: claimFitmentLeadsMock,
}));

async function importRoute() {
  return await import("../route");
}

describe("GET /hub/auth/callback", () => {
  beforeEach(() => {
    verifyOtpMock.mockReset();
    claimFitmentLeadsMock.mockReset();
    getUserMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
  });

  it("sends an already-signed-in user to the dashboard when the link was already used (clicked twice)", async () => {
    verifyOtpMock.mockResolvedValue({ data: { user: null }, error: { message: "Email link is invalid or has expired" } });
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const { GET } = await importRoute();
    const response = await GET(new Request("http://localhost/hub/auth/callback?next=&token_hash=used&type=magiclink"));
    expect(response.headers.get("location")).toBe("http://localhost/hub/account");
  });

  it("claims leads and redirects to /hub/account on a valid token_hash", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: { id: "user-123", email: "candidate@example.com" } },
      error: null,
    });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 2 });

    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?token_hash=valid-hash&type=magiclink");
    const response = await GET(request);

    expect(verifyOtpMock).toHaveBeenCalledWith({ token_hash: "valid-hash", type: "magiclink" });
    expect(claimFitmentLeadsMock).toHaveBeenCalledWith("user-123", "candidate@example.com");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/hub/account");
  });

  it("signs in from the Confirm signup email link (type=signup, empty next)", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: { id: "user-new", email: "new@example.com" } },
      error: null,
    });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 0 });

    const { GET } = await importRoute();
    // Shape produced by supabase/templates/confirmation.html: {{ .RedirectTo }}&token_hash=...&type=signup
    const request = new Request("http://localhost/hub/auth/callback?next=&token_hash=signup-hash&type=signup");
    const response = await GET(request);

    expect(verifyOtpMock).toHaveBeenCalledWith({ token_hash: "signup-hash", type: "signup" });
    expect(claimFitmentLeadsMock).toHaveBeenCalledWith("user-new", "new@example.com");
    expect(response.headers.get("location")).toBe("http://localhost/hub/account");
  });

  it("signs in from the Magic link email link (type=magiclink, empty next)", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: { id: "user-123", email: "candidate@example.com" } },
      error: null,
    });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 0 });

    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?next=&token_hash=ml-hash&type=magiclink");
    const response = await GET(request);

    expect(verifyOtpMock).toHaveBeenCalledWith({ token_hash: "ml-hash", type: "magiclink" });
    expect(response.headers.get("location")).toBe("http://localhost/hub/account");
  });

  it("returns to the pricing page when next=/hub/account/pricing, and ignores unknown next paths", async () => {
    verifyOtpMock.mockResolvedValue({ data: { user: { id: "user-123", email: "candidate@example.com" } }, error: null });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 0 });
    const { GET } = await importRoute();
    const ok = await GET(new Request("http://localhost/hub/auth/callback?next=%2Fhub%2Faccount%2Fpricing&token_hash=ml-hash&type=magiclink"));
    expect(ok.headers.get("location")).toBe("http://localhost/hub/account/pricing");
    const evil = await GET(new Request("http://localhost/hub/auth/callback?next=%2F%2Fevil.example&token_hash=ml-hash&type=magiclink"));
    expect(evil.headers.get("location")).toBe("http://localhost/hub/account");
  });

  it("returns to any /hub/account deep link (with query) but not encoded tricks", async () => {
    verifyOtpMock.mockResolvedValue({ data: { user: { id: "user-123", email: "candidate@example.com" } }, error: null });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 0 });
    const { GET } = await importRoute();
    const deep = "/hub/account/report?lead=abc";
    const ok = await GET(new Request(`http://localhost/hub/auth/callback?next=${encodeURIComponent(deep)}&token_hash=ml-hash&type=magiclink`));
    expect(ok.headers.get("location")).toBe(`http://localhost${deep}`);
    const trick = await GET(new Request(`http://localhost/hub/auth/callback?next=${encodeURIComponent("/hub/account/%5C%5Cevil.example")}&token_hash=ml-hash&type=magiclink`));
    expect(trick.headers.get("location")).toBe("http://localhost/hub/account");
  });

  it("redirects to /hub/login?error=expired on an invalid token_hash, without claiming", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });

    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?token_hash=bad-hash&type=magiclink");
    const response = await GET(request);

    expect(claimFitmentLeadsMock).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/hub/login?error=expired");
  });

  it("redirects to /hub/login?error=expired when token_hash is missing", async () => {
    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?type=magiclink");
    const response = await GET(request);

    expect(verifyOtpMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toContain("/hub/login?error=expired");
  });

  it("redirects to /hub/login?error=expired when type is missing", async () => {
    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?token_hash=valid-hash");
    const response = await GET(request);

    expect(verifyOtpMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toContain("/hub/login?error=expired");
  });

  it("redirects to /admin when next=/admin is present", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: { id: "user-123", email: "candidate@example.com" } },
      error: null,
    });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 0 });

    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?token_hash=valid-hash&type=magiclink&next=/admin");
    const response = await GET(request);

    expect(response.headers.get("location")).toContain("/admin");
  });

  it("ignores next values outside the allowlist and falls back to /hub/account", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: { id: "user-123", email: "candidate@example.com" } },
      error: null,
    });
    claimFitmentLeadsMock.mockResolvedValue({ claimedCount: 0 });

    const { GET } = await importRoute();
    const request = new Request(
      "http://localhost/hub/auth/callback?token_hash=valid-hash&type=magiclink&next=" + encodeURIComponent("https://evil.example.com"),
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toContain("/hub/account");
    expect(response.headers.get("location")).not.toContain("evil.example.com");
  });

  it("still redirects to /hub/account even if claiming fails", async () => {
    verifyOtpMock.mockResolvedValue({
      data: { user: { id: "user-123", email: "candidate@example.com" } },
      error: null,
    });
    claimFitmentLeadsMock.mockRejectedValue(new Error("db down"));

    const { GET } = await importRoute();
    const request = new Request("http://localhost/hub/auth/callback?token_hash=valid-hash&type=magiclink");
    const response = await GET(request);

    expect(response.headers.get("location")).toContain("/hub/account");
  });
});
