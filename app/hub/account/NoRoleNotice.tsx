import type { ComponentType } from "react";
import AuthenticatedFitmentChecker from "./AuthenticatedFitmentChecker";

// Feature pages that need a role, opened before any role was checked: say why, offer the check (was a silent redirect).
// Same empty-state card as Applications.
export default function NoRoleNotice({
  icon: Icon,
  title,
  sub,
  message,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  sub: string;
  message: string;
}) {
  return (
    <main>
      <div className="mx-auto" style={{ maxWidth: 820, padding: "28px 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            {title}
          </h1>
          <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 14, margin: 0 }}>
            {sub}
          </p>
        </div>
        <div className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14 }}>
          <div className="flex flex-col items-center text-center" style={{ gap: 12, padding: "48px 24px" }}>
            <div className="flex items-center justify-center bg-white/[0.06] text-white/60" style={{ width: 48, height: 48, borderRadius: "50%" }}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 380, margin: 0 }}>
              {message}
            </p>
            <AuthenticatedFitmentChecker />
          </div>
        </div>
      </div>
    </main>
  );
}

export const NEEDS_ROLE_TAIL = "Check your fit for a role first. It's free and takes about 2 minutes.";
