import { describe, it, expect } from "vitest";
import { getSkillDistributionTier } from "../SkillDistribution";

describe("getSkillDistributionTier", () => {
  it("bands the bottom of the range as Poor (destructive)", () => {
    expect(getSkillDistributionTier(0)).toEqual({ label: "Poor", textColor: "#E8798F" });
  });

  it("bands just under the Unsatisfactory threshold as Poor", () => {
    expect(getSkillDistributionTier(15).label).toBe("Poor");
  });

  it("bands the Unsatisfactory threshold as Unsatisfactory (destructive)", () => {
    expect(getSkillDistributionTier(16)).toEqual({ label: "Unsatisfactory", textColor: "#E8798F" });
  });

  it("bands just under the Good threshold as Unsatisfactory", () => {
    expect(getSkillDistributionTier(35).label).toBe("Unsatisfactory");
  });

  it("bands the Good threshold as Good (warning)", () => {
    expect(getSkillDistributionTier(36)).toEqual({ label: "Good", textColor: "#BD7E12" });
  });

  it("bands just under the Proficient threshold as Good", () => {
    expect(getSkillDistributionTier(45).label).toBe("Good");
  });

  it("bands the Proficient threshold as Proficient (success)", () => {
    expect(getSkillDistributionTier(46)).toEqual({ label: "Proficient", textColor: "#3FCB8C" });
  });

  it("bands just under the Exceptional threshold as Proficient", () => {
    expect(getSkillDistributionTier(60).label).toBe("Proficient");
  });

  it("bands the Exceptional threshold as Exceptional (success)", () => {
    expect(getSkillDistributionTier(61)).toEqual({ label: "Exceptional", textColor: "#3FCB8C" });
  });

  it("bands the top of the range as Exceptional", () => {
    expect(getSkillDistributionTier(100)).toEqual({ label: "Exceptional", textColor: "#3FCB8C" });
  });
});
