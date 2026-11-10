import { TRAIT_NAME, TRAIT_WORK_IMPLICATION, traitLevel, type Scores, type TraitKey } from "@/lib/personality";
import { strengthsAndDevelopment } from "@/lib/psychometrics/reportCopy";

// Shared by the dark Hub report and the light print/PDF page (`light`).
export default function StrengthsSection({ scores, candidateName, light = false }: { scores: Scores; candidateName: string; light?: boolean }) {
  const firstName = candidateName.split(/\s+/)[0] || candidateName;
  const { strengths, development } = strengthsAndDevelopment(scores);
  const c = light
    ? { card: { background: "#fff", border: "1px solid #F1E3E5" }, title: "#111827", body: "#4B5563", accent: "#EC1B25" }
    : { card: { background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)" }, title: "#fff", body: "rgba(255,255,255,0.65)", accent: "#ed1a24" };

  const column = (heading: string, traits: TraitKey[]) => (
    <div>
      <p className="font-[family-name:var(--font-poppins)] font-bold uppercase" style={{ fontSize: 11, letterSpacing: "0.04em", margin: "0 0 8px", color: c.accent }}>
        {heading}
      </p>
      {traits.map((t) => (
        <div key={t} style={{ marginBottom: 12 }}>
          <p className="font-[family-name:var(--font-poppins)] font-semibold" style={{ fontSize: 14, margin: "0 0 2px", color: c.title }}>
            {TRAIT_NAME[t]} · {Math.round(scores[t].pct)}%
          </p>
          <p className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: c.body }}>
            {TRAIT_WORK_IMPLICATION[t][traitLevel(scores[t].pct)](firstName)}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ ...c.card, borderRadius: 14, padding: 22, marginTop: 16, breakInside: "avoid" }}>
      <h2 className="font-[family-name:var(--font-gabarito)] font-semibold" style={{ fontSize: "1.15rem", margin: "0 0 14px", color: c.title }}>
        Strengths &amp; development areas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
        {column("Strengths", strengths)}
        {column("Development areas", development)}
      </div>
    </div>
  );
}
