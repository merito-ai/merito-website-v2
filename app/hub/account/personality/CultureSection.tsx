import { CULTURES } from "@/lib/psychometrics/cultureItems";
import type { CultureScores } from "@/lib/psychometrics/scoring";
import { cultureFit, type Fit } from "@/lib/psychometrics/cultureFit";
import { CULTURE_LABEL, CULTURE_MEANING, CULTURE_CAVEATS, FLAT_TEXT, UNRELIABLE_TEXT } from "@/lib/psychometrics/reportCopy";

// Culture mix + suitable organisation types + caveats. Shared by the dark Hub report and the
// light print/PDF page (`light`); the PDF can't expand <details>, so it lists all 7 benchmarks.
export default function CultureSection({ scores, reliable, light = false }: { scores: CultureScores; reliable: boolean | null; light?: boolean }) {
  const fit = cultureFit(scores, reliable);
  const c = light
    ? { card: { background: "#fff", border: "1px solid #F1E3E5" }, title: "#111827", body: "#4B5563", muted: "#6B7280", track: "#E5E7EB", accent: "#EC1B25" }
    : { card: { background: "rgb(29,25,31)", border: "1px solid rgb(49,47,55)" }, title: "#fff", body: "rgba(255,255,255,0.65)", muted: "rgba(255,255,255,0.4)", track: "rgba(255,255,255,0.08)", accent: "#ed1a24" };
  const font = "font-[family-name:var(--font-poppins)]";
  const label = (text: string) => (
    <p className={`${font} font-bold uppercase`} style={{ fontSize: 11, letterSpacing: "0.04em", margin: "20px 0 8px", color: c.accent }}>
      {text}
    </p>
  );
  const fitRow = (f: Fit, withBasis: boolean) => (
    <li key={f.key} style={{ marginBottom: 6 }}>
      <span className={`${font} font-semibold`} style={{ fontSize: 14, color: c.title }}>
        {f.label}: {f.fit}% fit
      </span>
      {withBasis && (
        <span className={font} style={{ display: "block", fontSize: 12, color: c.muted }}>
          Basis: {f.basis}
        </span>
      )}
    </li>
  );

  return (
    <div style={{ ...c.card, borderRadius: 14, padding: 22, marginTop: 16, breakInside: "avoid" }}>
      <h2 className="font-[family-name:var(--font-gabarito)] font-semibold" style={{ fontSize: "1.15rem", margin: 0, color: c.title }}>
        Work culture preferences
      </h2>

      {label("Your culture mix")}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CULTURES.map((k) => {
          const pct = Math.round(scores[k]);
          return (
            <div key={k}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span className={`${font} font-semibold`} style={{ fontSize: 13.5, color: c.title }}>
                  {CULTURE_LABEL[k]}
                </span>
                <span className={`${font} font-semibold`} style={{ fontSize: 12.5, color: c.accent }}>
                  {pct}/100
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 6, overflow: "hidden", background: c.track }} aria-hidden="true">
                <div style={{ height: "100%", borderRadius: 6, width: `${Math.min(100, Math.max(0, pct))}%`, background: c.accent }} />
              </div>
              <p className={font} style={{ fontSize: 12.5, margin: "4px 0 0", color: c.body }}>
                {CULTURE_MEANING[k]}
              </p>
            </div>
          );
        })}
      </div>

      {label("Suitable organisation types")}
      {fit.kind === "flat" && <p className={font} style={{ fontSize: 14, margin: 0, color: c.title }}>{FLAT_TEXT}</p>}
      {fit.kind === "unreliable" && <p className={font} style={{ fontSize: 13.5, margin: 0, color: c.body }}>{UNRELIABLE_TEXT}</p>}
      {fit.kind === "fit" &&
        (light ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>{fit.fits.map((f) => fitRow(f, true))}</ul>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>{fit.fits.slice(0, 3).map((f) => fitRow(f, false))}</ul>
            <details style={{ marginTop: 8 }}>
              <summary className={font} style={{ fontSize: 13, cursor: "pointer", color: c.muted }}>
                Show all 7
              </summary>
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>{fit.fits.map((f) => fitRow(f, true))}</ul>
            </details>
          </>
        ))}

      {label("Keep in mind")}
      <ul className={font} style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6, color: c.body }}>
        {CULTURE_CAVEATS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
