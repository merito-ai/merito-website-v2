import { describe, it, expect } from "vitest";
import { safeNextPath } from "../safeNext";

describe("safeNextPath", () => {
  it.each([
    "/hub/account",
    "/hub/account/pricing",
    "/hub/account/report?lead=abc-123",
    "/hub/account/interview#start",
    "/admin",
    "/admin/payments",
  ])("accepts %s", (p) => expect(safeNextPath(p)).toBe(p));

  it.each([
    null,
    "",
    "//evil.example",
    "https://evil.example/hub/account",
    "javascript:alert(1)",
    "hub/account",
    "/hub/accounts",
    "/administrator",
    "/hub",
    "/",
    "/hub/account//evil.example",
    "/hub/account/\\evil.example",
    "/\\evil.example",
    "/hub/account/%2F%2Fevil.example",
    "/hub/account/%5Cevil.example",
    "/hub/account/../../evil",
    "/hub/account/%2e%2e/%2e%2e/x",
    "/hub/account/%0d%0aSet-Cookie:x",
    "/hub/account/%E0%A4%A",
    "%2Fhub%2Faccount",
    "/hub/account/" + "a".repeat(600),
  ])("rejects %s", (p) => expect(safeNextPath(p)).toBeNull());
});
