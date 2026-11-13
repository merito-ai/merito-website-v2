import { describe, it, expect, vi, beforeEach } from "vitest";

const maybeSingleMock = vi.fn();
const eqMock = vi.fn();
const createSignedUrlMock = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: () => {
      const q = { select: () => q, eq: (...args: unknown[]) => (eqMock(...args), q), maybeSingle: maybeSingleMock };
      return q;
    },
    storage: { from: () => ({ createSignedUrl: createSignedUrlMock }) },
  }),
}));

import { getCvDownload, cvDownloadResponse, safeFileName } from "../cvDownload";

describe("getCvDownload", () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
    eqMock.mockReset();
    createSignedUrlMock.mockReset().mockResolvedValue({ data: { signedUrl: "https://x/signed" }, error: null });
  });

  it("returns a 60s signed URL for a stored file, scoped to the owner", async () => {
    maybeSingleMock.mockResolvedValue({ data: { name: "Asha", cv_path: "u1/l1/cv.pdf", cv_filename: 'my "cv".pdf', resume_text: "text" } });
    expect(await getCvDownload("u1", "l1")).toEqual({ kind: "url", url: "https://x/signed" });
    expect(eqMock).toHaveBeenCalledWith("id", "l1");
    expect(eqMock).toHaveBeenCalledWith("user_id", "u1");
    expect(createSignedUrlMock).toHaveBeenCalledWith("u1/l1/cv.pdf", 60, { download: "my _cv_.pdf" });
  });

  it("falls back to the extracted text as .txt when no file is stored", async () => {
    maybeSingleMock.mockResolvedValue({ data: { name: "Asha K", cv_path: null, cv_filename: null, resume_text: "hello" } });
    const cv = await getCvDownload("u1", "l1");
    expect(cv).toEqual({ kind: "text", text: "hello", filename: "Asha K-CV.txt" });
    const res = cvDownloadResponse(cv);
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="Asha K-CV.txt"');
    expect(await res.text()).toBe("hello");
  });

  it("returns null for another user's lead (no row) and the route answers 404", async () => {
    maybeSingleMock.mockResolvedValue({ data: null });
    const cv = await getCvDownload("someone-else", "l1");
    expect(cv).toBeNull();
    expect(cvDownloadResponse(cv).status).toBe(404);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });
});

describe("safeFileName", () => {
  it("strips quotes, slashes and newlines", () => {
    expect(safeFileName('a"b/c\r\nd.pdf')).toBe("a_b_c__d.pdf");
    expect(safeFileName("")).toBe("CV");
  });
});
