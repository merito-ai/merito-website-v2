import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const generateLinkMock = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({ auth: { admin: { generateLink: generateLinkMock } } }),
}));

const verifyOtpMock = vi.fn();
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({ auth: { verifyOtp: verifyOtpMock } }),
}));

async function importRoute() {
  return await import("../route");
}

function req(email: string | null) {
  const url = email === null
    ? "http://localhost/api/hub/review-login"
    : `http://localhost/api/hub/review-login?email=${encodeURIComponent(email)}`;
  return new Request(url);
}

describe("GET /api/hub/review-login", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    generateLinkMock.mockReset();
    generateLinkMock.mockResolvedValue({ data: { properties: { hashed_token: "hash_1" } }, error: null });
    verifyOtpMock.mockReset();
    verifyOtpMock.mockResolvedValue({ data: { user: { id: "u1", email: "review@example.com" } }, error: null });
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("404s when REVIEW_LOGIN_EMAIL is unset", async () => {
    const { GET } = await importRoute();
    const res = await GET(req("review@example.com"));
    expect(res.status).toBe(404);
    expect(generateLinkMock).not.toHaveBeenCalled();
  });

  it("404s when the email does not match the allowlisted address", async () => {
    vi.stubEnv("REVIEW_LOGIN_EMAIL", "review@example.com");
    const { GET } = await importRoute();
    const res = await GET(req("someone.else@example.com"));
    expect(res.status).toBe(404);
    expect(generateLinkMock).not.toHaveBeenCalled();
  });

  it("mints a magic token, verifies it, and 307s to /hub/account for the allowlisted email (case-insensitive)", async () => {
    vi.stubEnv("REVIEW_LOGIN_EMAIL", "review@example.com");
    const { GET } = await importRoute();
    const res = await GET(req("Review@Example.com"));

    expect(generateLinkMock).toHaveBeenCalledWith({ type: "magiclink", email: "review@example.com" });
    expect(verifyOtpMock).toHaveBeenCalledWith({ token_hash: "hash_1", type: "magiclink" });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/hub/account");
  });

  it("redirects back to /hub/login?error=expired when generateLink fails", async () => {
    vi.stubEnv("REVIEW_LOGIN_EMAIL", "review@example.com");
    generateLinkMock.mockResolvedValue({ data: {}, error: { message: "boom" } });
    const { GET } = await importRoute();
    const res = await GET(req("review@example.com"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/hub/login?error=expired");
    expect(verifyOtpMock).not.toHaveBeenCalled();
  });

  it("redirects back to /hub/login?error=expired when verifyOtp fails", async () => {
    vi.stubEnv("REVIEW_LOGIN_EMAIL", "review@example.com");
    verifyOtpMock.mockResolvedValue({ data: { user: null }, error: { message: "bad token" } });
    const { GET } = await importRoute();
    const res = await GET(req("review@example.com"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/hub/login?error=expired");
  });
});
