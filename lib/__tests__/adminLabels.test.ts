import { describe, it, expect } from "vitest";
import { formatActionLabel, formatChange, formatKey, formatTarget, formatValue } from "../adminLabels";

describe("adminLabels", () => {
  it("humanizes action keys and field keys", () => {
    expect(formatActionLabel("candidate.fitment_override")).toBe("Candidate fitment override");
    expect(formatKey("overallScore")).toBe("Overall score");
    expect(formatKey("role_title")).toBe("Role title");
  });

  it("formats nested values without JSON", () => {
    expect(formatValue(null)).toBe("none");
    expect(formatValue({ overallScore: 70, sections: ["a", "b"] })).toBe("Overall score: 70; Sections: a, b");
  });

  it("shows only changed fields between two objects", () => {
    expect(formatChange({ overallScore: 62, reason: "x" }, { overallScore: 70, reason: "x" })).toBe("Overall score: 62 → 70");
    expect(formatChange(null, { enabled: true })).toBe("Enabled: true");
    expect(formatChange("requested", "scheduled")).toBe("requested → scheduled");
  });

  it("shortens uuid targets", () => {
    expect(formatTarget("candidate", "0f8fad5b-d9cb-469f-a165-70867728950e")).toBe("Candidate 0f8fad5b");
    expect(formatTarget("email_template", "welcome")).toBe("Email template welcome");
  });
});
