"use client";

import { use, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseAuth";
import { getAbsoluteUrl } from "@/lib/site";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error: linkError } = use(searchParams);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");

    // TEMPORARY: one sandbox email skips the magic-link email entirely and is
    // logged straight in by /api/hub/review-login (for the Razorpay activation
    // review). Server re-checks the address against REVIEW_LOGIN_EMAIL; unset
    // either env var to disable. Remove after activation.
    const reviewEmail = process.env.NEXT_PUBLIC_REVIEW_LOGIN_EMAIL?.trim().toLowerCase();
    if (reviewEmail && email.trim().toLowerCase() === reviewEmail) {
      window.location.href = `/api/hub/review-login?email=${encodeURIComponent(email.trim())}`;
      return;
    }

    const supabase = createSupabaseBrowserClient();
    // `next` is re-validated against an allowlist server-side in
    // /hub/auth/callback — this is just passing the candidate value through.
    // Always include the `next` query (even empty) so the Supabase email
    // template can safely append `&token_hash=...` without conditional logic.
    const callbackPath = `/hub/auth/callback?next=${encodeURIComponent(next ?? "")}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // The exact URL this resolves to (both local and production) must be
        // added to the Supabase project's Auth → URL Configuration → Redirect URLs
        // allow-list, or the magic-link email will fail to redirect correctly.
        emailRedirectTo: getAbsoluteUrl(callbackPath),
      },
    });

    setStatus(error ? "error" : "sent");
  };

  return (
    <main
      className="bg-[#fdf8fb]"
      style={{
        minHeight: "60vh",
        padding: "64px 20px",
        background:
          "radial-gradient(560px circle at 50% 30%, rgba(237,26,36,0.06), transparent 70%), #fdf8fb",
      }}
    >
      <div className="bg-white border border-black/[0.08] mx-auto" style={{ maxWidth: 440, borderRadius: 24, padding: 32, boxShadow: "0px 18px 50px rgba(17,35,89,0.05)" }}>
        <h1 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.6rem", margin: 0 }}>
          Sign in to Merito HUB
        </h1>
        <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 14, lineHeight: 1.6, margin: "10px 0 24px" }}>
          Enter your email and we&apos;ll send you a link to sign in. No password needed.
        </p>

        {status === "sent" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <div
                className="flex items-center justify-center bg-[#ed1a24]/12 text-[#ed1a24] shrink-0"
                style={{ width: 32, height: 32, borderRadius: "50%" }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 6l8 7 8-7" />
                </svg>
              </div>
              <p className="font-[family-name:var(--font-poppins)] font-semibold text-black" style={{ fontSize: 15, margin: 0 }}>
                Check your email
              </p>
            </div>
            <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              We sent a sign-in link to
              <br />
              <strong className="text-black" style={{ wordBreak: "break-all" }}>{email.trim()}</strong>
            </p>
            <div
              className="font-[family-name:var(--font-poppins)] bg-[#f6f6f7] border border-[#ececec]"
              style={{ borderRadius: 10, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, color: "#4b4b4d" }}
            >
              <p className="font-semibold text-black" style={{ margin: "0 0 4px 0", fontSize: 13 }}>
                First time on Merito?
              </p>
              <p style={{ margin: 0 }}>
                Look for the email titled <strong className="text-black">Confirm your email to sign in to Merito</strong> and click{" "}
                <strong className="text-black">Confirm email and go to my dashboard</strong>.
              </p>
            </div>
            <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
              Can&apos;t see it? Check Spam or Promotions. It can take a minute to arrive.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="self-start font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24] underline"
              style={{ fontSize: 12.5, background: "none", border: "none", padding: 0, minHeight: 44, cursor: "pointer" }}
            >
              Send a new link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {linkError === "expired" && status === "idle" && (
              <p
                role="alert"
                className="font-[family-name:var(--font-poppins)] bg-[#fff4f4] border border-[#f5c2c4] text-[#7a1015]"
                style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 12px", padding: "10px 12px", borderRadius: 8 }}
              >
                That sign-in link has expired or was already used. Enter your email and we&apos;ll send a new one.
              </p>
            )}
            <label htmlFor="login-email" className="block font-[family-name:var(--font-poppins)] font-semibold text-black" style={{ fontSize: 13, marginBottom: 6 }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full box-border bg-white font-[family-name:var(--font-poppins)] text-black outline-none border border-[#dcdcdc] focus:border-[#ed1a24] transition-colors"
              style={{ padding: "13px 14px", borderRadius: 8, fontSize: 14, marginBottom: 12 }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full font-[family-name:var(--font-poppins)] font-semibold text-white transition-colors"
              style={{
                height: 50,
                borderRadius: 8,
                fontSize: 15,
                background: status === "sending" ? "#dcdcdc" : "#ed1a24",
                cursor: status === "sending" ? "default" : "pointer",
                border: "none",
              }}
            >
              {status === "sending" ? "Sending…" : "Send link"}
            </button>
            {status === "error" && (
              <p role="alert" style={{ fontSize: 12.5, color: "#c8151e", marginTop: 10, textAlign: "center" }}>
                Something went wrong. Please try again.
              </p>
            )}
            <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c] text-center" style={{ fontSize: 11.5, marginTop: 16 }}>
              Improve your candidature with Merito HUB
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
