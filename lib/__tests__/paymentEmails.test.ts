import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({ Resend: class { emails = { send: sendMock }; } } ));

const renderTemplateMock = vi.fn();
vi.mock("@/lib/emailTemplates", () => ({ renderTemplate: renderTemplateMock }));

const getUserByIdMock = vi.fn();
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ auth: { admin: { getUserById: getUserByIdMock } } }) }));

const ORIGINAL_ENV = { ...process.env };

describe("paymentEmails", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
    renderTemplateMock.mockReset();
    renderTemplateMock.mockResolvedValue({ subject: "rendered subject", bodyText: "rendered text", bodyHtml: "rendered html" });
    process.env = { ...ORIGINAL_ENV, RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "admin@merito.ai", CONTACT_TO_EMAIL: "shikha@merito.in" };
  });

  describe("sendPlanWelcomeEmail", () => {
    beforeEach(() => {
      getUserByIdMock.mockReset();
      getUserByIdMock.mockResolvedValue({ data: { user: { email: "buyer@example.test" } }, error: null });
    });

    it("emails the buyer their plan's benefits (table wording), numbered steps and the step-1 link", async () => {
      const { sendPlanWelcomeEmail } = await import("../paymentEmails");
      await sendPlanWelcomeEmail("u1", "plan_mentor");
      expect(getUserByIdMock).toHaveBeenCalledWith("u1");
      const msg = sendMock.mock.calls[0][0];
      expect(msg.to).toEqual(["buyer@example.test"]);
      expect(msg.from).toBe("admin@merito.ai");
      expect(msg.subject).toBe("Your Merito plan is active: Assess + Mentor + Apply");
      expect(msg.text).toContain("CV analysis with detailed report (3 roles)");
      expect(msg.text).toContain("Mentoring: 1 hour as two 30-min sessions");
      expect(msg.text).toContain("1. Check a role (CV report)");
      expect(msg.text).toContain("5. Mentoring (two 30-min sessions)");
      expect(msg.text).toMatch(/Start with step 1: check a role\s*\S+\/hub\/account/);
      expect(msg.html).toContain('/hub/account">Start with step 1: check a role</a>');
      expect(msg.text).toContain("Once you start, you have 10 days to complete it.");
      expect(msg.text).toContain("Application assistance: Our team will call or email you within 7 working days");
    });

    it("lists only Plan 1's benefits and steps for plan_prepare", async () => {
      const { sendPlanWelcomeEmail } = await import("../paymentEmails");
      await sendPlanWelcomeEmail("u1", "plan_prepare");
      const msg = sendMock.mock.calls[0][0];
      expect(msg.subject).toBe("Your Merito plan is active: Assess + Prepare");
      expect(msg.text).not.toContain("mentoring");
      expect(msg.text).toContain("5. Share consolidated profile");
      expect(msg.text).toContain("10 days to complete it");
      expect(msg.text).not.toContain("Application assistance");
    });

    it("points an upgrade at mentoring, not step 1", async () => {
      const { sendPlanWelcomeEmail } = await import("../paymentEmails");
      await sendPlanWelcomeEmail("u1", "plan_mentor", true);
      const msg = sendMock.mock.calls[0][0];
      expect(msg.text).toMatch(/Book your first mentoring session\s*\S+\/hub\/account\/expert/);
      expect(msg.text).not.toContain("Start with step 1");
    });

    it("sends nothing when the user has no email", async () => {
      getUserByIdMock.mockResolvedValue({ data: { user: null }, error: null });
      const { sendPlanWelcomeEmail } = await import("../paymentEmails");
      await sendPlanWelcomeEmail("u1", "plan_prepare");
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe("sendPaymentFailedAlertEmail", () => {
    it("renders the payment_failed_alert template with rupee-formatted amount and sends it to CONTACT_TO_EMAIL", async () => {
      const { sendPaymentFailedAlertEmail } = await import("../paymentEmails");

      await sendPaymentFailedAlertEmail({ orderId: "order_ABC123", amountPaise: 29900, candidateEmail: "rushi@example.com" });

      expect(renderTemplateMock).toHaveBeenCalledWith("payment_failed_alert", { orderId: "order_ABC123", amountRupees: "299.00", candidateEmail: "rushi@example.com" });
      expect(sendMock).toHaveBeenCalledWith({ from: "admin@merito.ai", to: ["shikha@merito.in"], subject: "rendered subject", text: "rendered text", html: "rendered html" });
    });

    it("throws when CONTACT_TO_EMAIL is missing", async () => {
      delete process.env.CONTACT_TO_EMAIL;
      const { sendPaymentFailedAlertEmail } = await import("../paymentEmails");

      await expect(
        sendPaymentFailedAlertEmail({ orderId: "order_ABC123", amountPaise: 29900, candidateEmail: "rushi@example.com" })
      ).rejects.toThrow("Email service is not configured (CONTACT_TO_EMAIL missing).");
    });

    it("throws when RESEND_API_KEY is missing", async () => {
      delete process.env.RESEND_API_KEY;
      const { sendPaymentFailedAlertEmail } = await import("../paymentEmails");

      await expect(
        sendPaymentFailedAlertEmail({ orderId: "order_ABC123", amountPaise: 29900, candidateEmail: "rushi@example.com" })
      ).rejects.toThrow("Email service is not configured (RESEND_API_KEY missing).");
    });
  });

  describe("sendPaymentGuardMismatchAlert", () => {
    it("sends an ops alert to CONTACT_TO_EMAIL with the order, payment and reported amount", async () => {
      const { sendPaymentGuardMismatchAlert } = await import("../paymentEmails");

      await sendPaymentGuardMismatchAlert({ orderId: "order_1", paymentId: "pay_1", amountPaise: 100 });

      expect(sendMock).toHaveBeenCalledTimes(1);
      const sent = sendMock.mock.calls[0][0];
      expect(sent.from).toBe("admin@merito.ai");
      expect(sent.to).toEqual(["shikha@merito.in"]);
      expect(sent.subject).toContain("amount mismatch");
      expect(sent.subject).toContain("order_1");
      expect(sent.text).toContain("pay_1");
      expect(sent.text).toContain("₹1.00");
    });

    it("throws when RESEND_API_KEY is missing", async () => {
      delete process.env.RESEND_API_KEY;
      const { sendPaymentGuardMismatchAlert } = await import("../paymentEmails");

      await expect(
        sendPaymentGuardMismatchAlert({ orderId: "order_1", paymentId: "pay_1", amountPaise: 100 })
      ).rejects.toThrow("Email service is not configured (RESEND_API_KEY missing).");
    });
  });

  describe("sendStuckPaymentAlert", () => {
    it("sends an ops alert with the order, rupee amount and age in hours", async () => {
      const { sendStuckPaymentAlert } = await import("../paymentEmails");

      await sendStuckPaymentAlert({ orderId: "order_1", amountPaise: 29900, ageHours: 24.4 });

      expect(sendMock).toHaveBeenCalledTimes(1);
      const sent = sendMock.mock.calls[0][0];
      expect(sent.to).toEqual(["shikha@merito.in"]);
      expect(sent.subject).toContain("stuck 24h+");
      expect(sent.text).toContain("₹299.00");
      expect(sent.text).toContain("24.4h");
    });
  });
});
